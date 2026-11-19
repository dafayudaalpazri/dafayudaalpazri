/**
 * QA camera (after html-demo's shoot.mjs): deterministic frames of the animated SVGs, and README previews.
 *
 *   node qa/shoot.ts frames <file.svg> <outDir> [--at 0,0.5,1,2.45,4] [--scale 1]
 *       Inlines the SVG, pauses every CSS animation and seeks it (Web Animations API), so a frame at t is
 *       the same on every run: each frame is a pure function of t.
 *   node qa/shoot.ts sheet <outFile.png> <a.svg> <b.svg> ... [--at 1.2] [--cols 2] [--bg #777]
 *       Contact sheet of several SVGs at one moment.
 *   node qa/shoot.ts final <outFile.png> <a.svg> ... --reduced
 *       What reduced motion shows: the resting state of every element.
 *   node qa/shoot.ts page <file.html> <outFile.png> [--width 1012] [--dark] [--wait 6]
 *       A page (e.g. the README preview) as a browser shows it, images and all, after `wait` seconds.
 *
 * Uses the installed Chrome through playwright-core (no browser download).
 */
import { chromium, type Page } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name: string, d?: string) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? d : args[i + 1];
};
const flag = (name: string) => args.includes(`--${name}`);
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--reduced', '--dark'].includes(args[i - 1])));

async function seekAll(page: Page, t: number) {
  await page.evaluate((ms) => {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = ms;
    }
  }, t * 1000);
  await page.waitForTimeout(60);
}

function inlinePage(svgs: string[], cols: number, bg: string, width: number): string {
  // each SVG in its own <iframe srcdoc> so ids and styles never collide between files
  const cells = svgs
    .map((f) => {
      const src = readFileSync(f, 'utf8');
      const m = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      const ratio = m ? Number(m[2]) / Number(m[1]) : 0.5;
      const doc = `<!doctype html><html><body style="margin:0;background:transparent">${src.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ')}</body></html>`;
      return `<figure style="margin:0"><iframe data-r="${ratio}" srcdoc="${doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" style="border:0;display:block;width:100%;aspect-ratio:1/${ratio};background:transparent"></iframe><figcaption style="font:12px system-ui;color:#ddd;padding:4px 2px">${basename(f)} · ${(src.length / 1024).toFixed(1)} KB</figcaption></figure>`;
    })
    .join('');
  return `<!doctype html><html><body style="margin:0;background:${bg};width:${width}px"><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px;padding:12px">${cells}</div></body></html>`;
}

async function seekFrames(page: Page, t: number) {
  for (const f of page.frames()) {
    await f.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = ms;
      }
    }, t * 1000);
  }
  await page.waitForTimeout(80);
}

const browser = await chromium.launch({ channel: 'chrome' });
const mode = positional[0];
try {
  if (mode === 'frames') {
    const [, svg, outDir] = positional;
    const at = (opt('at', '0,0.6,1.2,1.8,2.45,3,4') as string).split(',').map(Number);
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: Number(opt('scale', '1')) });
    await page.setContent(inlinePage([svg], 1, opt('bg', '#777')!, 1224));
    await page.waitForTimeout(300);
    for (const t of at) {
      await seekFrames(page, t);
      await page.locator('figure').first().screenshot({ path: resolve(outDir, `${basename(svg, '.svg')}@${t}s.png`) });
    }
    console.log(`frames: ${at.join(', ')}s → ${outDir}`);
  } else if (mode === 'sheet' || mode === 'final') {
    const [, out, ...svgs] = positional;
    const cols = Number(opt('cols', '2'));
    const width = Number(opt('width', String(cols * 700)));
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: mode === 'final' || flag('reduced') ? 'reduce' : 'no-preference' });
    await page.setContent(inlinePage(svgs, cols, opt('bg', '#777')!, width));
    await page.waitForTimeout(400);
    if (mode === 'sheet') await seekFrames(page, Number(opt('at', '6')));
    await page.screenshot({ path: out, fullPage: true });
    console.log(`${mode}: ${svgs.length} files → ${out}`);
  } else if (mode === 'page') {
    const [, html, out] = positional;
    const page = await browser.newPage({ viewport: { width: Number(opt('width', '1012')), height: 900 }, colorScheme: flag('dark') ? 'dark' : 'light', deviceScaleFactor: Number(opt('scale', '1')) });
    await page.goto(pathToFileURL(resolve(html)).href);
    await page.waitForTimeout(Number(opt('wait', '6')) * 1000);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`page → ${out}`);
  } else {
    console.error('usage: node qa/shoot.ts frames|sheet|final|page ...');
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
