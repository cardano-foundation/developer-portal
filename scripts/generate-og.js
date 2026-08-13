//
// Generates branded Open Graph cards for every doc under docs/ and every post
// under blog/.
//
// For each page we stamp its title and a section eyebrow onto one of the brand
// backgrounds and write a 1920x1080 JPG. Two theme components read the manifests
// this writes and point each page's og:image / twitter:image at its card, so pages
// need no per-page image frontmatter:
//   docs -> src/theme/DocItem/Metadata/index.js
//   blog -> src/theme/BlogPostPage/Metadata/index.js
//
// Cards are written under static/img/og/<source>/ (gitignored) and rebuilt on
// every `yarn build`, so nothing binary gets committed except the backgrounds +
// font.
//
// Command: yarn build-og
//

const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const TEMPLATE_DIR = path.join(ROOT, 'static', 'img', 'og', '_template');
const LOGO = path.join(ROOT, 'static', 'img', 'brand', 'cardano-horizontal-white.svg');
// Satori cannot parse the variable Chivo the site uses (it reads TTF/OTF/WOFF, not
// WOFF2), so card generation carries a static cut instanced from it. The card sets
// every string in ExtraLight, so that is the only weight needed. It lives here
// rather than in static/ because it is build-time input, not something a browser
// should ever download.
const FONT_EXTRALIGHT = path.join(__dirname, 'fonts', 'Chivo-200.ttf');

// The card is authored at this size, so every measurement below is a design value
// used as-is. Platforms that prefer a wider crop trim a few percent off the top and
// bottom, which stays clear of both the lockup and the headline.
const WIDTH = 1920;
const HEIGHT = 1080;

const CREAM = '#FFFAF3';
const NAVY = '#000629';

// Design measurements: both text blocks share a left inset, the lockup sits above
// them, and the headline is capped so it never runs under the artwork.
const INSET = 86;
const LOGO_BOX = { left: 86, top: 115, width: 549, height: 110 };
const EYEBROW = { top: 421, size: 50, tracking: 0.09 };
const HEADLINE = { top: 538, width: 1101, tracking: -0.02, lineHeight: 0.98 };

const fonts = [
  { name: 'Chivo', data: fs.readFileSync(FONT_EXTRALIGHT), weight: 200, style: 'normal' },
];

// Section label for a doc's eyebrow, from its path under docs/. Curriculum pages
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

// The two content trees. Each writes its own manifest so the theme component on
// either side imports only what it needs.
const SOURCES = [
  {
    name: 'docs',
    dir: path.join(ROOT, 'docs'),
    outDir: path.join(ROOT, 'static', 'img', 'og', 'docs'),
    urlBase: '/img/og/docs',
    eyebrow: eyebrowFor,
    // Docs that shouldn't get a card (archived changelog: huge, not a real page).
    exclude: new Set(['portal-archived-changelog.md']),
  },
  {
    name: 'blog',
    dir: path.join(ROOT, 'blog'),
    outDir: path.join(ROOT, 'static', 'img', 'og', 'blog'),
    urlBase: '/img/og/blog',
    // Every post carries the same eyebrow; the blog has no section hierarchy.
    eyebrow: () => 'DEV BLOG',
    exclude: new Set(),
  },
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
// The key is matched with leading whitespace allowed: a handful of older posts
// indent their frontmatter keys, which YAML accepts, and those posts carry no H1
// to fall back on.
function readTitle(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const line = fm[1].match(/^[ \t]*title:\s*(.+)$/m);
    if (line) return line[1].trim().replace(/^["']|["']$/g, '');
  }
  const h1 = src.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : null;
}

// Headline sizes, largest first. The design sets 138px and longer titles step
// down, so every card carries a similar visual weight.
const TITLE_SIZES = [138, 118, 100, 86, 74, 66];

// The headline is absolutely positioned, so its rendered bottom is already in
// card coordinates and compares directly against this: the lower edge, less the
// same inset the text keeps on the left.
const TITLE_BOTTOM = HEIGHT - INSET;

// The size the design asks for, by title length. 138px runs about 16 characters
// to a line in this cut, and three lines is as deep as the block can go before
// it reaches the lower edge, which is where these thresholds come from.
const CHARS_PER_LINE_AT_MAX = 16;
const MAX_LINES = 3;

function preferredSize(title) {
  const budget = MAX_LINES * CHARS_PER_LINE_AT_MAX * TITLE_SIZES[0];
  for (const size of TITLE_SIZES) {
    if (title.length <= budget / size) return size;
  }
  return TITLE_SIZES[TITLE_SIZES.length - 1];
}

// Measure where the headline actually ends once it has wrapped.
//
// Satori draws the text as glyph outlines, so the largest Y in the emitted path
// data is the bottom of the last line. Rendering into a tall box first means the
// text wraps naturally rather than being clipped by the card.
async function titleHeight(title, size) {
  const svg = await satori(titleNode(title, size), {
    width: WIDTH,
    height: HEIGHT * 4,
    fonts,
  });
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
  const nums = d.match(/-?\d+\.?\d*/g) || [];
  let maxY = 0;
  for (let i = 1; i < nums.length; i += 2) {
    const v = Number(nums[i]);
    if (v > maxY) maxY = v;
  }
  return maxY;
}

// Start from the size the design wants, then step down only while the headline
// would actually overflow.
//
// Length alone cannot decide this: what overflows is the height after wrapping,
// and two titles of the same length wrap to different line counts depending on
// where their spaces fall. Length still decides the look, though, so it stays in
// charge and the measurement is only a floor under it.
//
// The smallest step is that floor: a pathological title clips rather than
// shrinking without bound, and gets logged so it can be shortened at source.
async function fitTitleSize(title, onFloor) {
  const start = TITLE_SIZES.indexOf(preferredSize(title));
  for (let i = start; i < TITLE_SIZES.length; i++) {
    if ((await titleHeight(title, TITLE_SIZES[i])) <= TITLE_BOTTOM) return TITLE_SIZES[i];
  }
  onFloor(title);
  return TITLE_SIZES[TITLE_SIZES.length - 1];
}

// The headline, as its own node so the measuring pass and the render use
// byte-identical styling. Measuring anything else would drift from what ships.
function titleNode(title, size) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        left: INSET,
        top: HEADLINE.top,
        width: HEADLINE.width,
        display: 'flex',
        fontSize: size,
        fontWeight: 200,
        letterSpacing: size * HEADLINE.tracking,
        lineHeight: HEADLINE.lineHeight,
        color: CREAM,
      },
      children: title,
    },
  };
}

function card(title, eyebrow, size) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        fontFamily: 'Chivo',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: INSET,
              top: EYEBROW.top,
              fontSize: EYEBROW.size,
              fontWeight: 200,
              letterSpacing: EYEBROW.size * EYEBROW.tracking,
              lineHeight: HEADLINE.lineHeight,
              color: CREAM,
            },
            children: eyebrow,
          },
        },
        titleNode(title, size),
      ],
    },
  };
}

// The lockup is identical on every card, so it is rasterised once and composited
// into each background rather than re-rendered per page. The source SVG paints
// pure white; the card calls for the brand cream.
async function logoBuffer() {
  const svg = fs.readFileSync(LOGO, 'utf8').replace(/#fff\b/gi, CREAM);
  return sharp(Buffer.from(svg))
    .resize(LOGO_BOX.width, LOGO_BOX.height, { fit: 'fill' })
    .png()
    .toBuffer();
}

// A navy scrim washing left to right, from the design. The artwork is weighted to
// the right of the frame and the text to the left, and this is what keeps the two
// apart: it holds the headline on near-solid navy however busy the artwork behind
// it gets. Applied to every background so no single export has to remember it.
function scrim() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
       <defs>
         <linearGradient id="s" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0.079" stop-color="${NAVY}" stop-opacity="1"/>
           <stop offset="0.586" stop-color="${NAVY}" stop-opacity="0"/>
         </linearGradient>
       </defs>
       <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#s)"/>
     </svg>`
  );
}

// Backgrounds are whatever `bg-*.jpg` the template folder holds, so a new one is a
// drop-in. A page always draws the same one: the choice is a hash of its source
// path, which keeps cards stable across rebuilds while varying across the site.
function loadBackgrounds() {
  const files = fs
    .readdirSync(TEMPLATE_DIR)
    .filter((f) => /^bg-.*\.jpg$/.test(f))
    .sort();
  if (!files.length) throw new Error(`No bg-*.jpg backgrounds in ${TEMPLATE_DIR}`);
  return files.map((f) => path.join(TEMPLATE_DIR, f));
}

function pickBackground(key, count) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % count;
}

// Render one tree and return its manifest. The output directory is emptied first:
// it holds only generated files, so anything left behind is a card for a page that
// no longer exists.
async function generate(source, backgrounds) {
  fs.rmSync(source.outDir, { recursive: true, force: true });
  fs.mkdirSync(source.outDir, { recursive: true });

  const manifest = {};
  const oversized = [];
  let made = 0;
  let skipped = 0;

  for (const file of walk(source.dir)) {
    const rel = path.relative(source.dir, file);
    if (source.exclude.has(rel)) continue;
    const title = readTitle(file);
    if (!title) {
      console.warn(`  no title, skipped: ${path.relative(ROOT, file)}`);
      skipped++;
      continue;
    }
    const size = await fitTitleSize(title, (t) => oversized.push(t));
    const svg = await satori(card(title, source.eyebrow(rel), size), {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });

    const outRel = rel.replace(/\.md$/, '.jpg');
    const outPath = path.join(source.outDir, outRel);
    const key = path.relative(ROOT, file).split(path.sep).join('/');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await sharp(backgrounds[pickBackground(key, backgrounds.length)])
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toFile(outPath);

    // Key by forward-slash repo-relative path so each theme component's lookup
    // (which uses the forward-slash source path) matches on every OS, not just POSIX.
    manifest[path.relative(ROOT, file).split(path.sep).join('/')] =
      `${source.urlBase}/` + outRel.split(path.sep).join('/');
    made++;
  }

  fs.writeFileSync(
    path.join(source.outDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  console.log(`Generated ${made} ${source.name} OG cards (${skipped} skipped, no title)`);
  if (oversized.length) {
    console.log(
      `  ${oversized.length} title(s) overflow the card even at the smallest size; shorten them at the source:`
    );
    for (const t of oversized) console.log(`    - ${t}`);
  }
}

async function main() {
  const logo = await logoBuffer();
  // Each background is prepared once, with the lockup already burned in.
  const backgrounds = await Promise.all(
    loadBackgrounds().map((file) =>
      sharp(file)
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
        .composite([
          { input: scrim(), left: 0, top: 0 },
          { input: logo, left: LOGO_BOX.left, top: LOGO_BOX.top },
        ])
        .toBuffer()
    )
  );
  console.log(`Using ${backgrounds.length} background variant(s)`);

  for (const source of SOURCES) {
    await generate(source, backgrounds);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
