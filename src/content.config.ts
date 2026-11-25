import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    ogImage: z.string().optional(),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date(),
    hero: z.string(),
    heroAlt: z.string(),
    author: z.string().default('Balázs Sipos'),
    tours: z
      .array(
        z.object({
          name: z.string(),
          operator: z.string(),
          url: z.string(),
          bookUrl: z.string(),
          logo: z.string(),
          images: z.array(z.string()).default([]),
          rating: z.coerce.string(),
          reviews: z.string(),
          features: z.array(z.object({ text: z.string(), tip: z.string().optional() })).default([]),
          price: z.string(),
          review: z.string().nullable().optional(),
        }),
      )
      .optional(),
    related: z.array(z.object({ title: z.string(), href: z.string(), image: z.string() })).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    ogImage: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { guides, pages };
