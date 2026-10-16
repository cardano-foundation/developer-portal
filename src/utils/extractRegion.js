// Extract a named region, the lines between `#region NAME` and `#endregion NAME`, from a file
// imported as raw text. The markers are plain comments, so the example still runs and is tested.
//
//   import extractRegion from "@site/src/utils/extractRegion";
//   import Source from "!!raw-loader!@site/examples/.../file.ts";
//   <CodeBlock language="ts">{extractRegion(Source, "build")}</CodeBlock>

function findMarker(lines, keyword, name) {
  const marker = new RegExp(`#${keyword}\\s+(\\S+)`);
  return lines.findIndex((line) => (line.match(marker) || [])[1] === name);
}

function extractRegion(source, name) {
  const lines = source.split("\n");
  const start = findMarker(lines, "region", name);
  const end = findMarker(lines, "endregion", name);
  if (start === -1 || end < start) {
    throw new Error(`extractRegion: region "${name}" not found`);
  }

  const body = lines.slice(start + 1, end);
  const indents = body
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length);
  const indent = indents.length ? Math.min(...indents) : 0;

  return body
    .map((line) => line.slice(indent))
    .join("\n")
    .trim();
}

module.exports = extractRegion;
