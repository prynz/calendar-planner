// Renders app icons, splash and logo drafts from the brand package (single source of truth).
// Usage: pnpm brand:assets   (needs the preinstalled Playwright Chromium)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Node ≥ 22.18 strips TypeScript types natively; both modules have no imports.
import { logoMarkSvg } from '../../packages/brand/src/logo.ts';
import { palette } from '../../packages/ui/src/tokens.ts';

// Playwright is provided by the environment (global install), not a repo dependency.
const { chromium } = createRequire(import.meta.url)('playwright');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const appAssets = resolve(root, 'apps/mobile/assets/brand');
const docsLogo = resolve(root, 'docs/brand/logo');
// Embedded as data URL: pages rendered via setContent cannot load file:// fonts.
const font = (weight) =>
  `data:font/ttf;base64,${readFileSync(resolve(root, `node_modules/@expo-google-fonts/bricolage-grotesque/${weight}/BricolageGrotesque_${weight}.ttf`)).toString('base64')}`;

mkdirSync(appAssets, { recursive: true });
mkdirSync(docsLogo, { recursive: true });

const lime = palette.lime400;
const ink = palette.ink900;

/** Wordmark "nowish." with the full stop in lime – the "-ish" becomes a precise point. */
const lockup = ({ fg, dot, bg, markColor }) => `
  <div style="display:flex;align-items:center;gap:28px;padding:56px 72px;background:${bg};width:max-content">
    <div style="width:132px;height:132px">${logoMarkSvg({ fg: markColor })}</div>
    <div style="font-family:Brand;font-weight:700;font-size:120px;line-height:1;color:${fg};letter-spacing:-3px">nowish<span style="color:${dot}">.</span></div>
  </div>`;

const page = (body) => `<!doctype html><html><head><style>
  @font-face{font-family:Brand;font-weight:700;src:url('${font('700Bold')}')}
  html,body{margin:0;background:transparent} svg{display:block;width:100%;height:100%}
  #shot{width:max-content}
</style></head><body>${body}</body></html>`;

const square = (svg, size) => `<div id="shot" style="width:${size}px;height:${size}px">${svg}</div>`;

const jobs = [
  // App icon (iOS + fallback): lime mark on ink.
  { out: `${appAssets}/icon.png`, html: square(logoMarkSvg({ fg: lime, bg: ink }, 0.16), 1024) },
  // Android adaptive icon: transparent foreground inside the 66 % safe zone; monochrome for themed icons.
  {
    out: `${appAssets}/android-icon-foreground.png`,
    html: square(logoMarkSvg({ fg: lime }, 0.27), 1024),
    transparent: true,
  },
  {
    out: `${appAssets}/android-icon-monochrome.png`,
    html: square(logoMarkSvg({ fg: '#FFFFFF' }, 0.27), 1024),
    transparent: true,
  },
  { out: `${appAssets}/splash-icon.png`, html: square(logoMarkSvg({ fg: lime }), 512), transparent: true },
  // Logo drafts for docs/brand (marked as draft in docs/brand/logo/README.md).
  { out: `${docsLogo}/mark-app-icon.png`, html: square(logoMarkSvg({ fg: lime, bg: ink }, 0.16), 512) },
  {
    out: `${docsLogo}/lockup-dark.png`,
    html: `<div id="shot" style="display:inline-block">${lockup({ fg: palette.textOnDark, dot: lime, bg: ink, markColor: lime })}</div>`,
  },
  {
    out: `${docsLogo}/lockup-light.png`,
    html: `<div id="shot" style="display:inline-block">${lockup({ fg: ink, dot: palette.limeInk, bg: palette.cream50, markColor: ink })}</div>`,
  },
  { out: `${docsLogo}/mark-mono-ink.png`, html: square(logoMarkSvg({ fg: ink, bg: palette.cream50 }, 0.16), 512) },
];

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const p = await context.newPage();
  for (const job of jobs) {
    await p.setContent(page(job.html), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.locator('#shot').screenshot({ path: job.out, omitBackground: job.transparent === true });
    console.log('✓', job.out.replace(`${root}/`, ''));
  }
} finally {
  await browser.close();
}

// Vector sources of the mark for designers.
writeFileSync(`${docsLogo}/mark-lime.svg`, logoMarkSvg({ fg: lime }) + '\n');
writeFileSync(`${docsLogo}/mark-ink.svg`, logoMarkSvg({ fg: ink }) + '\n');
console.log('✓ docs/brand/logo/mark-*.svg');
