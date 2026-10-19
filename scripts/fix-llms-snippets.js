// Expands imported code snippets in the docusaurus-plugin-llms output: raw-loader only resolves
// for the rendered site, so llms.txt and the per-page .md files get the literal <CodeBlock> text
// instead of the code. We re-read the imports from the source doc and substitute a fenced block.
//
// A build step rather than a plugin because Docusaurus runs postBuild hooks concurrently.
// Delete once upstream resolves raw-loader imports.

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const DOCS_BUILD = path.join(BUILD, "docs");
const DOCS_SOURCE = path.join(ROOT, "docs");

// extractRegion is an ES module shared with the site, so it is loaded with import() in main().
let extractRegion;

// <CodeBlock language="ts" title="x.ts">{extractRegion(Name, "region")}</CodeBlock>
// The body may also be a template literal that joins several calls with text:
// {`${extractRegion(Name, "a")}\n${extractRegion(Name, "b")}`}
const CODE_BLOCK =
  /<CodeBlock\b([^>]*)>\s*\{\s*(extractRegion\([^)]*\)|`(?:[^`\\]|\\.)*`)\s*\}\s*<\/CodeBlock>/g;
// The optional third argument names nested regions to omit: "name" or ["a", "b"].
const CALL =
  /^extractRegion\(\s*(\w+)\s*,\s*['"]([^'"]+)['"]\s*(?:,\s*(['"][^'"]+['"]|\[[^\]]*\])\s*)?\)$/;
const INTERPOLATION = /\$\{([^}]*)\}/g;
const QUOTED_STRING = /['"]([^'"]+)['"]/g;
const TEMPLATE_ESCAPE = /\\(n|t|`|\$|\\)/g;
const TEMPLATE_ESCAPES = { n: "\n", t: "\t", "`": "`", $: "$", "\\": "\\" };
// import Name from "!!raw-loader!@site/examples/x.ts";
const RAW_LOADER_IMPORT =
  /^\s*import\s+(\w+)\s+from\s+['"]!!raw-loader!([^'"]+)['"];?\s*$/gm;

const attributeValue = (attributes, key) =>
  (attributes.match(new RegExp(`${key}=["']([^"']*)["']`)) || [])[1];

function findFiles(directory, matches, found = []) {
  if (!fs.existsSync(directory)) return found;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) findFiles(entryPath, matches, found);
    else if (matches(entry.name)) found.push(entryPath);
  }
  return found;
}

function collectSnippets() {
  const snippets = new Map();
  const docPaths = findFiles(DOCS_SOURCE, (name) => /\.mdx?$/.test(name));

  for (const docPath of docPaths) {
    const docText = fs.readFileSync(docPath, "utf8");
    const importedFiles = new Map();
    for (const [, name, importPath] of docText.matchAll(RAW_LOADER_IMPORT)) {
      importedFiles.set(name, importPath);
    }

    for (const match of docText.matchAll(CODE_BLOCK)) {
      const [blockText, attributes, body] = match;
      const doc = path.relative(ROOT, docPath);
      const sources = [];
      const resolveCall = (expression) => {
        const call = CALL.exec(expression.trim());
        if (!call) {
          throw new Error(
            `${doc}: cannot expand "${expression.trim()}" in a <CodeBlock>`,
          );
        }
        const [, name, region, omitArgument = ""] = call;
        const importPath = importedFiles.get(name);
        if (!importPath) {
          throw new Error(`${doc}: ${name} is not imported with raw-loader`);
        }
        const sourcePath = importPath.startsWith("@site/")
          ? path.join(ROOT, importPath.slice("@site/".length))
          : path.resolve(path.dirname(docPath), importPath);
        const omit = [...omitArgument.matchAll(QUOTED_STRING)].map(
          ([, omitted]) => omitted,
        );
        sources.push(`"${region}" from ${path.relative(ROOT, sourcePath)}`);
        return extractRegion(fs.readFileSync(sourcePath, "utf8"), region, omit);
      };

      // In a template, unescape only the literal text: the extracted code is inserted as is.
      const code = body.startsWith("`")
        ? body
            .slice(1, -1)
            .split(INTERPOLATION)
            .map((part, index) =>
              index % 2
                ? resolveCall(part)
                : part.replace(TEMPLATE_ESCAPE, (_, c) => TEMPLATE_ESCAPES[c]),
            )
            .join("")
        : resolveCall(body);
      const backtickRuns = (code.match(/`+/g) || []).map(
        (run) => run.length + 1,
      );
      const fence = "`".repeat(Math.max(3, ...backtickRuns));
      const language = attributeValue(attributes, "language") || "";
      const titleText = attributeValue(attributes, "title");
      const title = titleText ? ` title="${titleText}"` : "";

      // Identical blocks are indistinguishable in the output, so one page would silently show the
      // other's code, and nothing downstream could catch it.
      const existing = snippets.get(blockText);
      if (existing && existing.code !== code) {
        throw new Error(
          `${doc} and ${existing.doc} contain the identical <CodeBlock> but different code. ` +
            `Give one of them a distinct title so they can be told apart.`,
        );
      }

      snippets.set(blockText, {
        doc,
        sources: sources.join(" + "),
        code,
        replacement: `${fence}${language}${title}\n${code}\n${fence}`,
      });
    }
  }
  return snippets;
}

const readFile = (filePath) =>
  fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

async function main() {
  ({ default: extractRegion } = await import(
    pathToFileURL(path.join(ROOT, "src/utils/extractRegion.js")).href
  ));

  const snippets = collectSnippets();
  const markdownPages = findFiles(DOCS_BUILD, (name) => name.endsWith(".md"));
  const outputFiles = [
    path.join(BUILD, "llms.txt"),
    path.join(BUILD, "llms-full.txt"),
    ...markdownPages,
  ].filter((filePath) => fs.existsSync(filePath));

  let expanded = 0;
  for (const filePath of outputFiles) {
    const before = readFile(filePath);
    let after = before;
    for (const [blockText, { replacement }] of snippets) {
      const parts = after.split(blockText);
      expanded += parts.length - 1;
      after = parts.join(replacement);
    }
    if (after !== before) fs.writeFileSync(filePath, after);
  }

  // Verify the code is present rather than that work happened, so this also catches the plugin
  // dropping the <CodeBlock> entirely (docusaurus-plugin-llms >= 0.5 deletes component tags).
  const llmsFullText = readFile(path.join(BUILD, "llms-full.txt"));
  const markdownPagesText = markdownPages.map(readFile).join("\n");
  const missing = [...snippets.values()].filter(
    ({ code }) =>
      !llmsFullText.includes(code) || !markdownPagesText.includes(code),
  );

  console.log(
    `[fix-llms-snippets] ${snippets.size - missing.length}/${snippets.size} ` +
      `snippet(s) present in the llms output (${expanded} replacements)`,
  );

  if (missing.length) {
    console.error(
      `[fix-llms-snippets] ${missing.length} snippet(s) missing from the llms output:`,
    );
    for (const { doc, sources } of missing) {
      console.error(`  - ${doc}: ${sources}`);
    }
    console.error(
      "  docusaurus-plugin-llms is probably not passing the <CodeBlock> through as text any more " +
        "(>= 0.5 deletes component tags), so there was nothing here to expand.",
    );
    process.exit(1);
  }

  // A call the pattern above does not recognise is never expanded and never reported as missing,
  // so also fail on any extractRegion() text that reached the output.
  const unexpanded = outputFiles.filter((filePath) =>
    /\{\s*extractRegion\(/.test(readFile(filePath)),
  );
  if (unexpanded.length) {
    console.error(
      `[fix-llms-snippets] ${unexpanded.length} file(s) still contain an unexpanded extractRegion() call:`,
    );
    for (const filePath of unexpanded) {
      console.error(`  - ${path.relative(ROOT, filePath)}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
