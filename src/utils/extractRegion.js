// Extract a named region — the lines between `// #region NAME` and
// `// #endregion NAME` — from a file imported as raw text via raw-loader.
// The markers are plain comments, so the code still runs and is still tested.
//
//   import extractRegion from '@site/src/utils/extractRegion';
//   import Source from '!!raw-loader!@site/examples/.../file.ts';
//   <CodeBlock language="ts">{extractRegion(Source, 'build')}</CodeBlock>

export default function extractRegion(source, name) {
  const lines = source.split('\n');
  const start = lines.findIndex((l) => l.includes(`#region ${name}`));
  const end = lines.findIndex((l) => l.includes(`#endregion ${name}`));
  if (start === -1 || end === -1) {
    throw new Error(`extractRegion: region "${name}" not found`);
  }

  const body = lines.slice(start + 1, end);
  const widths = body.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
  const indent = widths.length ? Math.min(...widths) : 0;
  return body.map((l) => l.slice(indent)).join('\n').trim();
}
