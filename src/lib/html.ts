import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';

const dimCache = new Map<string, { width: number; height: number } | null>();

/** Width/height of an image in /public, so the browser can reserve space (no layout shift). */
export function dims(src: string) {
  if (!src?.startsWith('/')) return null;
  if (dimCache.has(src)) return dimCache.get(src)!;
  let out: { width: number; height: number } | null = null;
  try {
    const file = path.join(process.cwd(), 'public', decodeURIComponent(src));
    const d = imageSize(fs.readFileSync(file));
    if (d.width && d.height) out = { width: d.width, height: d.height };
  } catch {
    out = null;
  }
  dimCache.set(src, out);
  return out;
}

/** Adds lazy loading + intrinsic size to every <img>, and safe rel on external links. */
export function enhance(html: string) {
  html = html.replace(/<img\b([^>]*?)\/?>/g, (m, attrs: string) => {
    const src = attrs.match(/\bsrc="([^"]+)"/)?.[1] ?? '';
    let extra = '';
    if (!/\bloading=/.test(attrs)) extra += ' loading="lazy"';
    if (!/\bdecoding=/.test(attrs)) extra += ' decoding="async"';
    if (!/\bwidth=/.test(attrs)) {
      const d = dims(src);
      if (d) extra += ` width="${d.width}" height="${d.height}"`;
    }
    return `<img${attrs}${extra}>`;
  });
  html = html.replace(/<a\b([^>]*\bhref="https?:\/\/(?!www\.wandervienna\.com)[^"]*"[^>]*)>/g, (m, attrs: string) => {
    if (/\brel=/.test(attrs)) return m;
    return `<a${attrs} rel="noopener">`;
  });
  html = html.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
  return html;
}

export type TocItem = { id: string; text: string };

/** h2 headings (with ids added by Astro's Markdown renderer) for the table of contents. */
export function toc(html: string): TocItem[] {
  return [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, '').replace(/&#x26;|&amp;/g, '&').replace(/\s+/g, ' ').trim(),
  }));
}

/** Splits rendered HTML on `{{name}}` placeholder paragraphs. */
export function splitPlaceholders(html: string) {
  const parts: { type: 'html' | 'slot'; value: string }[] = [];
  let last = 0;
  for (const m of html.matchAll(/<p>\{\{([\w-]+)\}\}<\/p>/g)) {
    parts.push({ type: 'html', value: html.slice(last, m.index) });
    parts.push({ type: 'slot', value: m[1] });
    last = m.index! + m[0].length;
  }
  parts.push({ type: 'html', value: html.slice(last) });
  return parts;
}
