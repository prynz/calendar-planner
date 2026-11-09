// Renders CONCEPT MOCKUPS of core screens (docs/design/concept/). These are design proposals for
// later phases – never app screenshots. Every image carries a visible "MOCKUP" label.
// Usage: pnpm design:mockups   (needs the preinstalled Playwright Chromium)
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logoMarkSvg } from '../../packages/brand/src/logo.ts';
import { categoryColors as cat, palette as p } from '../../packages/ui/src/tokens.ts';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const out = resolve(root, 'docs/design/concept');
mkdirSync(out, { recursive: true });

const font = (pkg, file) =>
  `data:font/ttf;base64,${readFileSync(resolve(root, `node_modules/@expo-google-fonts/${pkg}/${file}`)).toString('base64')}`;

const css = `
@font-face{font-family:Display;font-weight:700;src:url('${font('bricolage-grotesque', '700Bold/BricolageGrotesque_700Bold.ttf')}')}
@font-face{font-family:Display;font-weight:600;src:url('${font('bricolage-grotesque', '600SemiBold/BricolageGrotesque_600SemiBold.ttf')}')}
@font-face{font-family:Text;font-weight:400;src:url('${font('inter', '400Regular/Inter_400Regular.ttf')}')}
@font-face{font-family:Text;font-weight:600;src:url('${font('inter', '600SemiBold/Inter_600SemiBold.ttf')}')}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Text;background:#d9d4c8;padding:40px;width:max-content}
.sheet{display:flex;gap:36px;align-items:flex-start}
.col{display:flex;flex-direction:column;gap:14px;align-items:center}
.cap{font:600 15px Text;color:${p.ink900};max-width:360px;text-align:center}
.cap small{display:block;font:400 13px Text;color:#4c4f57;margin-top:4px}
.phone{width:360px;height:760px;border-radius:44px;overflow:hidden;position:relative;border:8px solid #111;box-shadow:0 20px 50px rgba(0,0,0,.25)}
.dark{background:${p.ink900};color:${p.textOnDark}}
.light{background:${p.cream50};color:${p.ink900}}
.in{padding:52px 20px 0}
.mockup{position:absolute;top:14px;left:50%;transform:translateX(-50%);background:${p.red700};color:#fff;font:600 11px Text;letter-spacing:.08em;padding:4px 10px;border-radius:99px;z-index:9;white-space:nowrap}
.eyebrow{font:600 13px Text;color:${p.textMutedOnDark}}
.light .eyebrow{color:${p.textMutedOnLight}}
.h1{font:600 28px/34px Display}
.big{font:700 56px/60px Display}
.pill{display:inline-flex;align-items:center;justify-content:center;border-radius:99px;font:600 13px Text;padding:8px 14px}
.lime{background:${p.lime400};color:${p.ink900}}
.card{border-radius:24px;padding:18px}
.tab{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;gap:4px;padding:4px;border-radius:99px;background:${p.ink700}}
.tab span{font:600 13px Text;padding:14px 16px;border-radius:99px;color:${p.textMutedOnDark}}
.tab span.on{background:${p.lime400};color:${p.ink900}}
.row{display:flex;align-items:center;gap:10px}
.av{width:30px;height:30px;border-radius:99px;background:${p.ink700};border:2px solid ${p.ink800};display:flex;align-items:center;justify-content:center;font:600 11px Text;color:${p.textOnDark};margin-left:-8px}
.av:first-child{margin-left:0}
.bar{height:10px;border-radius:99px;background:${p.ink700};overflow:hidden}
.bar i{display:block;height:100%;background:${p.lime400};border-radius:99px}
.bento{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{border-radius:28px;padding:16px;background:${p.ink800};min-height:118px;display:flex;flex-direction:column;justify-content:space-between}
.tile b{font:600 13px Text;color:${p.textMutedOnDark}}
.tile .v{font:700 30px Display}
`;

const mark = (fg, size) => `<div style="width:${size}px;height:${size}px">${logoMarkSvg({ fg })}</div>`;
const MOCK = '<div class="mockup">MOCKUP · Konzept, kein App-Screenshot</div>';

const onboarding = `<div class="phone dark">${MOCK}<div class="in" style="height:100%;display:flex;flex-direction:column;padding-bottom:36px">
  <div class="row" style="gap:10px">${mark(p.lime400, 34)}<span style="font:700 22px Display">nowish<span style="color:${p.lime400}">.</span></span></div>
  <div style="margin-top:auto">
    <div class="big">Endlich</div>
    <div class="big"><span style="border:3px solid ${p.lime400};border-radius:99px;padding:0 14px">pünktlich.</span></div>
    <div class="big" style="color:${p.textMutedOnDark}">Ohne Stress.</div>
    <p style="font:400 17px/24px Text;color:${p.textMutedOnDark};margin:20px 0 28px">Nowish sagt dir nicht nur, wann es losgeht – sondern wann <b style="color:${p.textOnDark}">du</b> losmusst.</p>
    <div class="pill lime" style="width:100%;height:56px;font-size:15px">Los geht’s</div>
  </div></div></div>`;

const today = `<div class="phone dark">${MOCK}<div class="in">
  <div class="eyebrow">Montag, 9. November</div><div class="h1">Dein Tag</div>
  <div class="card" style="background:${p.lime400};color:${p.ink900};margin-top:16px">
    <div style="font:600 13px Text">Spieleabend bei Olivia · 19:00</div>
    <div style="font:700 56px/60px Display;margin:4px 0">19:32 los</div>
    <div style="font:400 14px Text">22 Min. Fahrrad + 8 Min. Puffer · Bereit-Check: 2 von 4</div>
    <div class="bar" style="background:rgba(13,14,18,.15);margin-top:14px"><i style="width:64%;background:${p.ink900}"></i></div>
    <div style="font:600 12px Text;margin-top:6px">noch 1 Std. 47 Min. bis Losgehen</div>
  </div>
  <div style="display:flex;gap:8px;margin:18px 0 12px">${['So 8', 'Mo 9', 'Di 10', 'Mi 11', 'Do 12']
    .map(
      (d, i) =>
        `<div class="pill ${i === 1 ? 'lime' : ''}" style="flex:1;flex-direction:column;height:64px;${i === 1 ? '' : `background:${p.ink800};color:${p.textOnDark}`}">${d.split(' ')[1]}<small style="font:400 11px Text">${d.split(' ')[0]}</small></div>`,
    )
    .join('')}</div>
  ${[
    ['in 30 Min.', 'Zahnarzt', '08:30 – 09:15', cat.health],
    ['in 4 Std.', 'Mittag mit Alex', '12:30 – 13:30', cat.social],
  ]
    .map(
      ([
        s,
        t,
        time,
        c,
      ]) => `<div style="margin-bottom:10px"><span class="pill" style="background:${c};color:${p.ink900};border-radius:14px 14px 0 0;padding:6px 14px">${s}</span>
      <div class="card" style="background:${c};color:${p.ink900};border-top-left-radius:0;padding:14px 18px"><div style="font:600 18px Text">${t}</div><div style="font:600 13px Text;margin-top:4px">${time}</div></div></div>`,
    )
    .join('')}
  <div class="tab"><span class="on">Heute</span><span>Events</span><span>＋</span><span>Ich</span></div></div></div>`;

const event = `<div class="phone dark">${MOCK}<div style="height:200px;background:linear-gradient(135deg,${cat.social},${p.violet500});padding:52px 20px 0;color:${p.ink900}">
  <span class="pill" style="background:${p.ink900};color:${p.textOnDark}">Sa, 14. Nov · 16:00</span>
  <div style="font:700 34px/38px Display;margin-top:46px">Grillabend am See</div></div>
  <div style="padding:16px 20px" class="bento">
    <div class="tile" style="background:${p.lime400};color:${p.ink900}"><b style="color:${p.ink900}">Zusagen</b><div class="v">5/8</div><div class="row">${['O', 'T', 'M', 'G'].map((x) => `<div class="av">${x}</div>`).join('')}</div></div>
    <div class="tile"><b>Mitbringliste</b><div class="v">6/9</div><div class="bar"><i style="width:66%"></i></div></div>
    <div class="tile"><b>Aufgaben</b><div style="font:400 14px/20px Text">✓ Grill reservieren<br>○ Kohle kaufen</div></div>
    <div class="tile"><b>Kosten</b><div class="v">48 €</div><div style="font:400 13px Text;color:${p.textMutedOnDark}">du bekommst 12 €</div></div>
    <div class="tile" style="grid-column:span 2;min-height:96px"><b>Chat · 3 neu</b><div style="font:400 14px Text">Mia: Ich bring noch Lichterketten mit ✨</div></div>
  </div><div class="tab"><span>Heute</span><span class="on">Events</span><span>＋</span><span>Ich</span></div></div>`;

const vote = `<div class="phone light">${MOCK}<div class="in">
  <div class="eyebrow">Umfrage · endet morgen 18:00</div><div class="h1">Wann grillen wir?</div>
  <div style="position:relative;height:430px;margin-top:26px">
    <div class="card" style="position:absolute;inset:24px 22px auto;height:360px;background:${p.cream100}"></div>
    <div class="card" style="position:absolute;inset:12px 11px auto;height:370px;background:${p.ink700}"></div>
    <div class="card" style="position:absolute;inset:0 0 auto;height:380px;background:${p.lime400};color:${p.ink900};display:flex;flex-direction:column">
      <div class="eyebrow" style="color:${p.ink900}">Option 2 von 4</div>
      <div style="font:700 44px/48px Display;margin-top:10px">Samstag<br>14. Nov</div>
      <div style="font:600 18px Text;margin-top:8px">16:00 – 21:00</div>
      <div style="margin-top:auto;font:400 14px Text">5 können schon · Wetter: 14 °C, trocken</div>
    </div></div>
  <div style="display:flex;gap:10px;margin-top:8px">
    <div class="pill" style="flex:1;height:56px;background:${p.white};color:${p.ink900};border:1.5px solid ${p.ink900}">✕ Passt nicht</div>
    <div class="pill" style="flex:1;height:56px;background:${p.ink900};color:${p.textOnDark}">✓ Passt</div></div>
  <div style="font:400 13px Text;color:${p.textMutedOnLight};text-align:center;margin-top:10px">Wischen oder tippen – beides geht.</div></div></div>`;

const screens = [
  ['Onboarding', 'Display-Typo mit eingerahmtem Schlüsselwort (R3)', onboarding],
  ['Heute mit Losgeh-Zeit', 'Anti-Chaos-Engine: große Zahl, Zeitbalken, Bereit-Check (Phase 3/6)', today],
  ['Event-Detail als Bento', 'Zusagen, Mitbringliste, Aufgaben, Kosten, Chat auf einen Blick (Phase 4/5)', event],
  ['Terminfindung per Swipe', 'Heller Creme-Modus, Kartenstapel mit Button-Alternative (R5, Phase 5)', vote],
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div style="font:700 26px Display;color:${p.ink900};margin-bottom:6px">Nowish – Konzept-Mockups der Kernscreens</div>
<div style="font:400 15px Text;color:#4c4f57;margin-bottom:28px">MOCKUP, Stand 2026-11-09 · Gestaltungsvorschlag für spätere Phasen, keine App-Screenshots · Inhalte erfunden</div>
<div class="sheet">${screens.map(([t, s, h]) => `<div class="col">${h}<div class="cap">${t}<small>${s}</small></div></div>`).join('')}</div></body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1.5 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = resolve(out, '2026-11-09-mockup-core-screens.png');
  await page.locator('body').screenshot({ path: file });
  console.log('✓', file.replace(`${root}/`, ''));
} finally {
  await browser.close();
}
