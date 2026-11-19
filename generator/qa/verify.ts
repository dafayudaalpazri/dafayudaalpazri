/**
 * Static checks for everything the README ships. Run after a build: `npm run verify`.
 *
 *   - every image the README points at exists, in both themes
 *   - every SVG is self-contained (GitHub shows them through <img>: no external URLs, scripts, data: URIs,
 *     foreignObject or web fonts would load anyway), has a viewBox and a size, and no duplicate ids
 *   - animated SVGs carry the reduced-motion rule
 *   - size budget per file
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const problems: string[] = [];
const README = readFileSync(resolve(repo, 'README.md'), 'utf8');

const refs = [...README.matchAll(/(?:src|srcset)="\.\/([^"]+)"/g)].map((m) => m[1]);
for (const r of refs) if (!existsSync(resolve(repo, r))) problems.push(`README points at a missing file: ${r}`);
const darkRefs = refs.filter((r) => r.endsWith('-dark.svg'));
for (const r of darkRefs) if (!refs.includes(r.replace('-dark.svg', '-light.svg'))) problems.push(`no light twin for ${r}`);

const files: string[] = [];
const walk = (d: string) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.svg')) files.push(p);
  }
};
walk(resolve(repo, 'assets'));

const BUDGET = 100 * 1024;
let total = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const name = relative(repo, f).replace(/\\/g, '/');
  total += s.length;
  if (!refs.includes(name)) problems.push(`not used by the README: ${name}`);
  if (!/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(s)) problems.push(`${name}: does not start with a namespaced <svg>`);
  if (!/viewBox="0 0 [\d.]+ [\d.]+"/.test(s)) problems.push(`${name}: no viewBox`);
  if (!/ width="[\d.]+" height="[\d.]+"/.test(s)) problems.push(`${name}: no width/height`);
  if (/<script|<foreignObject|@import|@font-face/i.test(s)) problems.push(`${name}: script, foreignObject or font loading`);
  if (/(?:href|src)="(?:https?:|data:|\/\/)/.test(s) || /url\((?:["']?)(?:https?:|data:|\/\/)/.test(s)) problems.push(`${name}: external or data: reference`);
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) problems.push(`${name}: duplicate ids ${[...new Set(dup)].join(', ')}`);
  for (const m of s.matchAll(/(?:href="#|url\(#)([^")]+)/g)) if (!ids.includes(m[1])) problems.push(`${name}: reference to missing #${m[1]}`);
  if (/animation:/.test(s) && !/prefers-reduced-motion:reduce/.test(s)) problems.push(`${name}: animated but no reduced-motion rule`);
  if (s.length > BUDGET) problems.push(`${name}: ${(s.length / 1024).toFixed(1)} KB is over the ${BUDGET / 1024} KB budget`);
}

console.log(`${files.length} SVGs (${(total / 1024).toFixed(0)} KB, about ${(total / 2048).toFixed(0)} KB per theme), ${refs.length} README image references`);
if (problems.length) {
  console.error(problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exitCode = 1;
} else console.log('  ✓ all checks passed');
