const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const DOCS = path.join(ROOT, "docs");
const LLMS_FULL = path.join(BUILD, "llms-full.txt");

const CODE_BLOCK =
  /<CodeBlock\b([^>]*)>\s*\{\s*((?:extractRegion|validatorHash)\([^)]*\)|`(?:[^`\\]|\\.)*`)\s*\}\s*<\/CodeBlock>/g;
const CALL =
  /^(extractRegion|validatorHash)\(\s*(\w+)\s*,\s*['"]([^'"]+)['"]\s*(?:,\s*(['"][^'"]+['"]|\[[^\]]*\])\s*)?\)$/;
const IMPORT =
  /^\s*import\s+(\w+)\s+from\s+['"](?:!!raw-loader!)?([^'"]+)['"];?\s*$/gm;
const INTERPOLATION = /\$\{([^}]*)\}/g;
const QUOTED = /['"]([^'"]+)['"]/g;
const ESCAPE = /\\(n|t|`|\$|\\)/g;
const ESCAPED = { n: "\n", t: "\t", "`": "`", $: "$", "\\": "\\" };
const UNEXPANDED = /\{\s*(?:extractRegion|validatorHash)\(/;

const read = (file) =>
  fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

function listFiles(directory, extension, found = []) {
  if (!fs.existsSync(directory)) return found;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) listFiles(file, extension, found);
    else if (extension.test(entry.name)) found.push(file);
  }
  return found;
}

async function loadHelper(name) {
  const file = path.join(ROOT, "src/utils", `${name}.js`);
  const { default: helper } = await import(pathToFileURL(file).href);
  return helper;
}

function importsOf(docFile, docText) {
  const imports = new Map();
  for (const [, name, importPath] of docText.matchAll(IMPORT)) {
    const file = importPath.startsWith("@site/")
      ? path.join(ROOT, importPath.slice("@site/".length))
      : path.resolve(path.dirname(docFile), importPath);
    imports.set(name, file);
  }
  return imports;
}

function runCall(expression, imports, helpers, doc) {
  const call = CALL.exec(expression.trim());
  if (!call) throw new Error(`${doc}: cannot expand "${expression.trim()}"`);

  const [, helper, name, key, omit = ""] = call;
  const file = imports.get(name);
  if (!file || !fs.existsSync(file)) {
    throw new Error(`${doc}: ${name} is not imported from a file`);
  }

  if (helper === "validatorHash") {
    return helpers.validatorHash(JSON.parse(read(file)), key);
  }
  const omitted = [...omit.matchAll(QUOTED)].map(([, region]) => region);
  return helpers.extractRegion(read(file), key, omitted);
}

function evaluate(body, imports, helpers, doc) {
  if (!body.startsWith("`")) return runCall(body, imports, helpers, doc);

  return body
    .slice(1, -1)
    .split(INTERPOLATION)
    .map((part, index) =>
      index % 2 === 1
        ? runCall(part, imports, helpers, doc)
        : part.replace(ESCAPE, (_, char) => ESCAPED[char]),
    )
    .join("");
}

function fenced(code, attributes) {
  const attribute = (key) =>
    (attributes.match(new RegExp(`${key}=["']([^"']*)["']`)) || [])[1];
  const longestRun = Math.max(
    0,
    ...(code.match(/`+/g) || []).map((run) => run.length),
  );
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  const title = attribute("title") ? ` title="${attribute("title")}"` : "";
  return `${fence}${attribute("language") || ""}${title}\n${code}\n${fence}`;
}

function snippetsOf(docFile, helpers) {
  const docText = read(docFile);
  const doc = path.relative(ROOT, docFile);
  const imports = importsOf(docFile, docText);

  return [...docText.matchAll(CODE_BLOCK)].map(([block, attributes, body]) => {
    const code = evaluate(body, imports, helpers, doc);
    return { block, code, replacement: fenced(code, attributes) };
  });
}

function pageOf(docFile) {
  const relative = path.relative(DOCS, docFile).replace(/\.mdx?$/, ".md");
  return path.join(BUILD, "docs", relative);
}

function sectionOf(fullText, pageText) {
  const lines = pageText.split("\n");
  for (let skip = 0; skip < Math.min(8, lines.length); skip += 1) {
    const section = lines.slice(skip).join("\n").trim();
    const first = fullText.indexOf(section);
    if (first === -1) continue;
    return fullText.indexOf(section, first + 1) === -1 ? section : null;
  }
  return null;
}

function expand(text, snippets) {
  return snippets.reduce(
    (result, { block, replacement }) => result.split(block).join(replacement),
    text,
  );
}

function fail(message, items) {
  console.error(`[fix-llms-snippets] ${message}`);
  for (const item of items) console.error(`  - ${item}`);
  process.exit(1);
}

async function main() {
  const helpers = {
    extractRegion: await loadHelper("extractRegion"),
    validatorHash: await loadHelper("validatorHash"),
  };

  let fullText = read(LLMS_FULL);
  let total = 0;
  const missing = [];

  for (const docFile of listFiles(DOCS, /\.mdx?$/)) {
    const snippets = snippetsOf(docFile, helpers);
    if (!snippets.length) continue;

    const doc = path.relative(ROOT, docFile);
    const page = pageOf(docFile);
    const pageText = read(page);
    const section = sectionOf(fullText, pageText);
    if (!pageText || !section) {
      throw new Error(
        `${doc}: its page is missing from build/docs or llms-full.txt`,
      );
    }

    const expandedPage = expand(pageText, snippets);
    const expandedSection = expand(section, snippets);
    fs.writeFileSync(page, expandedPage);
    fullText = fullText.replace(section, () => expandedSection);

    total += snippets.length;
    for (const { code } of snippets) {
      if (!expandedPage.includes(code) || !expandedSection.includes(code)) {
        missing.push(doc);
      }
    }
  }
  fs.writeFileSync(LLMS_FULL, fullText);

  console.log(
    `[fix-llms-snippets] ${total - missing.length}/${total} snippet(s) in the llms output`,
  );
  if (missing.length) {
    fail(
      `${missing.length} snippet(s) missing; docusaurus-plugin-llms may have stopped passing <CodeBlock> through as text:`,
      [...new Set(missing)],
    );
  }

  const pages = listFiles(path.join(BUILD, "docs"), /\.md$/);
  const outputs = [path.join(BUILD, "llms.txt"), LLMS_FULL, ...pages];
  const unexpanded = outputs.filter((file) => UNEXPANDED.test(read(file)));
  if (unexpanded.length) {
    fail(
      "unexpanded snippet calls left in:",
      unexpanded.map((file) => path.relative(ROOT, file)),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
