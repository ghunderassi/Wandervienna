// One-off importer: downloads the live Webflow pages and every asset they use
// from the Webflow CDN, so the new site no longer depends on Webflow.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://www.wandervienna.com';
const PAGES = ['/', '/about', '/vienna-to-hallstatt-day-trip', '/how-to-get-to-hallstatt-from-vienna', '/contact', '/search'];
const RAW_DIR = 'import/raw';
const IMG_DIR = 'public/images';
const UA = 'Mozilla/5.0 (site migration importer)';

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

function localName(url) {
  const file = decodeURIComponent(new URL(url).pathname.split('/').pop());
  const m = file.match(/^([0-9a-f]{24})_(.*)$/);
  const id = m ? m[1].slice(-8) : '';
  const rest = m ? m[2] : file;
  const ext = path.extname(rest).toLowerCase();
  const base = slug(path.basename(rest, path.extname(rest))) || 'image';
  return `${base}${id ? '-' + id : ''}${ext}`;
}

await mkdir(RAW_DIR, { recursive: true });
await mkdir(IMG_DIR, { recursive: true });

const assets = new Set();
const cssUrls = new Set();
for (const p of PAGES) {
  const res = await fetch(SITE + p, { headers: { 'user-agent': UA } });
  const html = await res.text();
  const name = p === '/' ? 'index' : p.slice(1);
  await writeFile(`${RAW_DIR}/${name}.html`, html);
  console.log(res.status, p, html.length);
  for (const m of html.matchAll(/https:\/\/(?:cdn\.prod\.website-files\.com|uploads-ssl\.webflow\.com|assets\.website-files\.com)\/[^"'\s,]+/g)) {
    let u = m[0].replace(/&amp;/g, '&').replace(/\)+;?$/, (x) => (/\(/.test(m[0]) ? x : ''));
    if (/\.css(\?|$)/.test(u)) { cssUrls.add(u); continue; }
    if (/\.js(\?|$)/.test(u)) continue;
    if (!/\.(webp|png|jpe?g|gif|svg|avif|ico|mp4|webm)$/i.test(u)) continue;
    u = u.replace(/-p-\d+(\.[a-z0-9]+)$/i, '$1'); // original instead of resized variant
    assets.add(u);
  }
}

const manifest = {};
for (const u of [...assets].sort()) {
  const name = localName(u);
  try {
    const r = await fetch(u, { headers: { 'user-agent': UA } });
    if (!r.ok) throw new Error(String(r.status));
    await writeFile(`${IMG_DIR}/${name}`, Buffer.from(await r.arrayBuffer()));
    manifest[u] = `/images/${name}`;
  } catch (e) {
    console.error('FAILED', u, e.message);
    manifest[u] = null;
  }
}
let i = 0;
for (const u of cssUrls) {
  const r = await fetch(u, { headers: { 'user-agent': UA } });
  await writeFile(`${RAW_DIR}/webflow-${i++}.css`, await r.text());
}
await writeFile('import/assets-manifest.json', JSON.stringify(manifest, null, 2));
console.log(`assets: ${Object.keys(manifest).length}, css: ${cssUrls.size}`);
