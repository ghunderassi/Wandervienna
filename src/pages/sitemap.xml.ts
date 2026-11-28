import { getCollection } from 'astro:content';
import site from '../data/site.json';

export async function GET() {
  const guides = await getCollection('guides');
  const urls = [
    { loc: `${site.url}/` },
    { loc: `${site.url}/about` },
    ...guides.map((g) => ({ loc: `${site.url}/${g.id}`, lastmod: g.data.dateModified.toISOString().slice(0, 10) })),
    { loc: `${site.url}/contact` },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
