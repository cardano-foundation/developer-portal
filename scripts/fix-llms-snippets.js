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

function collectSnippets(helpers) {
  const snippets = new Map();

  for (const docFile of listFiles(DOCS, /\.mdx?$/)) {
    const docText = read(docFile);
    const doc = path.relative(ROOT, docFile);
    const imports = importsOf(docFile, docText);

    for (const [block, attributes, body] of docText.matchAll(CODE_BLOCK)) {
      const code = evaluate(body, imports, helpers, doc);

      const existing = snippets.get(block);
      if (existing && existing.code !== code) {
        throw new Error(
          `${doc} and ${existing.doc} contain the identical <CodeBlock> but different code. ` +
            `Give one of them a distinct title so they can be told apart.`,
        );
      }
      snippets.set(block, { doc, code, replacement: fenced(code, attributes) });
    }
  }
  return snippets;
}

function expandOutputs(files, snippets) {
  for (const file of files) {
    let text = read(file);
    for (const [block, { replacement }] of snippets) {
      text = text.split(block).join(replacement);
    }
    fs.writeFileSync(file, text);
  }
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

  const snippets = collectSnippets(helpers);
  const pages = listFiles(path.join(BUILD, "docs"), /\.md$/);
  const outputs = [path.join(BUILD, "llms.txt"), LLMS_FULL, ...pages].filter(
    fs.existsSync,
  );

  expandOutputs(outputs, snippets);

  const fullText = read(LLMS_FULL);
  const pagesText = pages.map(read).join("\n");
  const missing = [...snippets.values()].filter(
    ({ code }) => !fullText.includes(code) || !pagesText.includes(code),
  );
  console.log(
    `[fix-llms-snippets] ${snippets.size - missing.length}/${snippets.size} snippet(s) in the llms output`,
  );
  if (missing.length) {
    fail(
      `${missing.length} snippet(s) missing; docusaurus-plugin-llms may have stopped passing <CodeBlock> through as text:`,
      missing.map(({ doc }) => doc),
    );
  }

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
