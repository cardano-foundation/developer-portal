//
// Generates branded Open Graph cards for every doc under docs/.
//
// For each doc page we stamp its title (plus a section eyebrow) onto the shared
// 2026-brand background and write a 1200x630 JPG. The DocItem/Metadata swizzle
// (src/theme/DocItem/Metadata/index.js) reads the manifest this writes and points
// each page's og:image / twitter:image at its card, so pages need no per-page
// image frontmatter.
//
// Cards are written under static/img/og/docs/ (gitignored) and rebuilt on every
// `yarn build`, so nothing binary gets committed except the template + fonts.
//
// Command: yarn build-og
//

const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const TEMPLATE = path.join(ROOT, 'static', 'img', 'og', '_template', 'og-background.png');
const OUT_DIR = path.join(ROOT, 'static', 'img', 'og', 'docs');
const FONT_REGULAR = path.join(ROOT, 'static', 'fonts', 'Chivo-400.ttf');
const FONT_BOLD = path.join(ROOT, 'static', 'fonts', 'Chivo-700.ttf');

// Docs that shouldn't get a card (archived changelog: huge, not a real page).
const EXCLUDE = new Set(['portal-archived-changelog.md']);

const WIDTH = 1200;
const HEIGHT = 630;

// Developer-persona palette (from the 2026 brand kit).
const CREAM = '#fffaf3'; // headline
const LAVENDER = '#c7c2e6'; // eyebrow

const fonts = [
  { name: 'Chivo', data: fs.readFileSync(FONT_REGULAR), weight: 400, style: 'normal' },
  { name: 'Chivo', data: fs.readFileSync(FONT_BOLD), weight: 700, style: 'normal' },
];

// Walk a directory tree collecting .md files (skipping partials named _*.md).
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) out.push(full);
  }
  return out;
}

// The page title for the headline: prefer frontmatter `title:`, else fall back to
// the first H1 (how Docusaurus itself derives a title when frontmatter omits one).
// Titles that contain a colon are quoted in frontmatter, so strip surrounding quotes.
function readTitle(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const line = fm[1].match(/^title:\s*(.+)$/m);
    if (line) return line[1].trim().replace(/^["']|["']$/g, '');
  }
  const h1 = src.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : null;
}

// Section label for the eyebrow, from the doc's path under docs/. Curriculum pages
// show their track (developers/curriculum/<track>/... -> "SMART CONTRACTS"); every
// other doc shows its sub-section if nested, else its top-level audience
// (operators/monitoring/... -> "MONITORING"; operators/overview.md -> "OPERATORS").
function eyebrowFor(rel) {
  const seg = rel.split(path.sep);
  let key;
  if (seg[0] === 'developers' && seg[1] === 'curriculum') {
    key = seg.length > 3 ? seg[2] : 'curriculum';
  } else {
    // Nested docs show their sub-section (seg[1]); flat docs show their top-level
    // folder, or the filename (minus .md) for a doc sitting directly under docs/.
    key = seg.length > 2 ? seg[1] : seg[0].replace(/\.md$/, '');
  }
  const special = { dapps: 'dApps', iot: 'IoT' };
  return special[key] ?? key.replace(/-/g, ' ').toUpperCase();
}

// Fit the headline to the space: short titles get big and bold, long ones
// scale down so every card carries the same visual weight.
function titleSize(title) {
  const n = title.length;
  if (n <= 15) return 88;
  if (n <= 22) return 78;
  if (n <= 32) return 68;
  if (n <= 44) return 58;
  return 52;
}

function card(title, eyebrow) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: 'Chivo',
      },
      children: [
        // Centered content block: a quiet tracked eyebrow over the headline.
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', paddingLeft: 96, paddingRight: 96 },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontWeight: 400,
                    fontSize: 21,
                    letterSpacing: 4,
                    color: LAVENDER,
                    marginBottom: 26,
                  },
                  children: eyebrow,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontWeight: 700,
                    fontSize: titleSize(title),
                    lineHeight: 1.03,
                    letterSpacing: -1.5,
                    color: CREAM,
                    maxWidth: 760,
                    textShadow: '0px 2px 20px rgba(0,3,10,0.40)',
                  },
                  children: title,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function main() {
  const files = walk(DOCS_DIR);
  const bg = await sharp(TEMPLATE)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const manifest = {};
  let made = 0;
  let skipped = 0;

  for (const file of files) {
    const rel = path.relative(DOCS_DIR, file);
    if (EXCLUDE.has(rel)) continue;
    const title = readTitle(file);
    if (!title) {
      skipped++;
      continue;
    }
    const eyebrow = eyebrowFor(rel);
    const svg = await satori(card(title, eyebrow), { width: WIDTH, height: HEIGHT, fonts });

    const outRel = rel.replace(/\.md$/, '.jpg');
    const outPath = path.join(OUT_DIR, outRel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(bg)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outPath);

    // Key by forward-slash repo-relative path so the swizzle's lookup (which uses
    // the forward-slash source path) matches on every OS, not just POSIX.
    manifest[path.relative(ROOT, file).split(path.sep).join('/')] =
      '/img/og/docs/' + outRel.split(path.sep).join('/');
    made++;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Generated ${made} docs OG cards (${skipped} skipped, no title)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
