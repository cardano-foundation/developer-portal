/**
 * Pull a named region out of a source file so docs can show real, tested code.
 *
 * A region is delimited by comment markers, which keeps the file valid and
 * runnable in its own project:
 *
 *     // #region NAME
 *     ...code...
 *     // #endregion NAME
 *
 * Line, block, hash, SQL and HTML comment styles are all recognised.
 *
 * Four behaviours make the markers a layout tool rather than a straitjacket:
 *
 * - **Repeated names join.** A name may open and close several times; the parts
 *   are concatenated in file order, separated by a blank line. Anything between
 *   them, an explanatory comment say, stays in the file but not in the doc.
 * - **Regions nest.** A smaller region may live inside a larger one, and marker
 *   lines never appear in the output.
 * - **Parts can be left out.** Pass the name of a nested region to omit it, so
 *   one file can serve a page that has met that code and a page that has not.
 * - **Values can be swapped.** A `#replace` directive rewrites text on its way
 *   into the doc, so a file can keep the value its own project needs while the
 *   page shows the one its reader needs:
 *
 *       // #replace ../../blueprints/vault.plutus.json -> ../../on-chain/plutus.json
 *
 *   Either side may be quoted when it contains spaces. A directive applies to
 *   the whole file, so every region of it shows the same substitution.
 *
 * @module extractRegion
 */

const ANY_REGION_MARKER = /^[^\w]*#(?:end)?region\s+\S+[^\w]*$/;
const REPLACE_MARKER = /^[^\w]*#replace\s+(.+)$/;
const REPLACE_PAIR = /^(.*?)\s+->\s+(.*)$/;
const COMMENT_TAIL = /\s*(?:\*\/|-->)\s*$/;
const QUOTED = /^(["'])(.*)\1$/;

const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A marker occupies a whole line: comment punctuation, the tag, the name, and
 * whatever closes the comment. Only non-word characters may sit on either side,
 * which keeps `types` from matching `types-extra` and keeps prose that merely
 * mentions a marker from being treated as one.
 *
 * @param {string} tag  `#region` or `#endregion`.
 * @param {string} name  Region name to match exactly.
 * @returns {RegExp}
 */
const markerFor = (tag, name) => new RegExp(`^[^\\w]*${tag}\\s+${escapeForRegExp(name)}[^\\w]*$`);

const isBlank = (line) => !line.trim();

const unquote = (value) => {
  const quoted = QUOTED.exec(value.trim());
  return quoted ? quoted[2] : value.trim();
};

/**
 * @param {string[]} lines
 * @returns {Array<[string, string]>} `[from, to]` pairs, in file order.
 * @throws If a directive is missing its `->`.
 */
const collectReplacements = (lines) =>
  lines.flatMap((line) => {
    const directive = REPLACE_MARKER.exec(line);
    if (!directive) return [];

    const pair = REPLACE_PAIR.exec(directive[1].replace(COMMENT_TAIL, '').trim());
    const from = pair && unquote(pair[1]);
    if (!from) {
      throw new Error(`extractRegion: #replace needs "from -> to", got: ${line.trim()}`);
    }
    return [[from, unquote(pair[2])]];
  });

const applyReplacements = (text, pairs) =>
  pairs.reduce((result, [from, to]) => result.split(from).join(to), text);

/**
 * @param {string[]} lines
 * @param {string} name
 * @returns {string[][]} One entry per opening of the region, in file order.
 * @throws If the region is opened and never closed.
 */
const collectBlocks = (lines, name) => {
  const opens = markerFor('#region', name);
  const closes = markerFor('#endregion', name);
  const blocks = [];
  let start = -1;

  lines.forEach((line, index) => {
    if (start === -1) {
      if (opens.test(line)) start = index;
    } else if (closes.test(line)) {
      blocks.push(lines.slice(start + 1, index));
      start = -1;
    }
  });

  if (start !== -1) {
    throw new Error(`extractRegion: region "${name}" opened at line ${start + 1} and never closed`);
  }
  return blocks;
};

/**
 * @param {string[]} block
 * @param {string[]} omit
 * @returns {{ kept: string[], found: string[] }} The lines that survive, and
 *   which of the `omit` names were actually present, so the caller can report
 *   one that matched nothing.
 */
const removeNested = (block, omit) => {
  const openers = omit.map((name) => ({ name, pattern: markerFor('#region', name) }));
  const closers = new Map(omit.map((name) => [name, markerFor('#endregion', name)]));
  const kept = [];
  const found = new Set();
  let skipping = null;

  for (const line of block) {
    if (skipping) {
      if (closers.get(skipping).test(line)) skipping = null;
      continue;
    }

    const opener = openers.find(({ pattern }) => pattern.test(line));
    if (opener) {
      skipping = opener.name;
      found.add(opener.name);
      continue;
    }
    kept.push(line);
  }

  return { kept, found: [...found] };
};

const trimBlankEdges = (lines) => {
  let first = 0;
  let last = lines.length;
  while (first < last && isBlank(lines[first])) first += 1;
  while (last > first && isBlank(lines[last - 1])) last -= 1;
  return lines.slice(first, last);
};

const collapseBlankRuns = (lines) =>
  lines.filter((line, index) => !isBlank(line) || (index > 0 && !isBlank(lines[index - 1])));

const dedent = (lines) => {
  const indents = lines
    .filter((line) => !isBlank(line))
    .map((line) => line.length - line.trimStart().length);
  const shared = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(shared));
};

/**
 * @param {string} source  File contents, imported with raw-loader.
 * @param {string} name  Region to extract.
 * @param {string|string[]} [omit]  Nested regions to leave out.
 * @returns {string} The region's code, dedented, with markers and directives
 *   removed and every `#replace` applied.
 * @throws If the region is missing or unclosed, if a `#replace` is malformed,
 *   or if a name in `omit` is not inside the region, since a typo there would
 *   silently show code meant to be hidden.
 *
 * @example
 * extractRegion(source, 'validator')                   // the whole validator
 * extractRegion(source, 'validator', 'mint-handler')   // ...without that part
 * extractRegion(source, 'mint-handler')                // only that part
 */
export default function extractRegion(source, name, omit = []) {
  const omitted = (Array.isArray(omit) ? omit : [omit]).filter(Boolean);
  const lines = source.split('\n');
  const replacements = collectReplacements(lines);
  const blocks = collectBlocks(lines, name);

  if (blocks.length === 0) {
    throw new Error(`extractRegion: region "${name}" not found`);
  }

  const omittedFound = new Set();
  const parts = blocks.map((block) => {
    const { kept, found } = removeNested(block, omitted);
    found.forEach((foundName) => omittedFound.add(foundName));

    const lines = kept.filter((line) => !ANY_REGION_MARKER.test(line) && !REPLACE_MARKER.test(line));
    return collapseBlankRuns(trimBlankEdges(lines));
  });

  const missing = omitted.filter((omittedName) => !omittedFound.has(omittedName));
  if (missing.length) {
    throw new Error(`extractRegion: "${missing.join('", "')}" not found inside region "${name}"`);
  }

  const body = parts.flatMap((part, index) => (index ? ['', ...part] : part));
  return applyReplacements(dedent(body).join('\n').trim(), replacements);
}
