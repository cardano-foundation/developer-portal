// Expands imported code snippets in the docusaurus-plugin-llms output: raw-loader only resolves
// for the rendered site, so llms.txt and the per-page .md files get the literal <CodeBlock> text
// instead of the code. We re-read the imports from the source doc and substitute a fenced block.
//
// A build step rather than a plugin because Docusaurus runs postBuild hooks concurrently.
// Delete once upstream resolves raw-loader imports.

const fs = require("fs");
const path = require("path");
const extractRegion = require("../src/utils/extractRegion");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const DOCS_BUILD = path.join(BUILD, "docs");
const DOCS_SOURCE = path.join(ROOT, "docs");

// <CodeBlock language="ts" title="x.ts">{extractRegion(Name, "region")}</CodeBlock>
const CODE_BLOCK =
  /<CodeBlock\b([^>]*)>\s*\{\s*extractRegion\(\s*(\w+)\s*,\s*['"]([^'"]+)['"]\s*\)\s*\}\s*<\/CodeBlock>/g;
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
      const [blockText, attributes, name, region] = match;
      const importPath = importedFiles.get(name);
      if (!importPath) continue;

      const sourcePath = importPath.startsWith("@site/")
        ? path.join(ROOT, importPath.slice("@site/".length))
        : path.resolve(path.dirname(docPath), importPath);
      if (!fs.existsSync(sourcePath)) continue;

      const code = extractRegion(fs.readFileSync(sourcePath, "utf8"), region);
      const backtickRuns = (code.match(/`+/g) || []).map(
        (run) => run.length + 1,
      );
      const fence = "`".repeat(Math.max(3, ...backtickRuns));
      const language = attributeValue(attributes, "language") || "";
      const titleText = attributeValue(attributes, "title");
      const title = titleText ? ` title="${titleText}"` : "";
      const doc = path.relative(ROOT, docPath);

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
        sourceFile: path.relative(ROOT, sourcePath),
        region,
        code,
        replacement: `${fence}${language}${title}\n${code}\n${fence}`,
      });
    }
  }
  return snippets;
}

const readFile = (filePath) =>
  fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

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
  for (const { doc, region, sourceFile } of missing) {
    console.error(`  - ${doc}: "${region}" from ${sourceFile}`);
  }
  console.error(
    "  docusaurus-plugin-llms is probably not passing the <CodeBlock> through as text any more " +
      "(>= 0.5 deletes component tags), so there was nothing here to expand.",
  );
  process.exit(1);
}
