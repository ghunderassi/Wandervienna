import site from '../data/site.json';

export const abs = (p: string) => new URL(p, site.url).href;

export const organization = {
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  url: `${site.url}/`,
  logo: { '@type': 'ImageObject', url: abs('/images/untitled-design-17-2-ded0d53f.png') },
  sameAs: site.social.map((s) => s.href),
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function article(o: { path: string; headline: string; description: string; image: string; author: string; published: Date; modified: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(o.path) },
    headline: o.headline,
    description: o.description,
    image: [abs(o.image)],
    author: { '@type': 'Person', name: o.author, url: abs('/about') },
    publisher: organization,
    datePublished: o.published.toISOString().slice(0, 10),
    dateModified: o.modified.toISOString().slice(0, 10),
  };
}
