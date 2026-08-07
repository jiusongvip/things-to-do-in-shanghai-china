import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    category: z.string(),
    image: z.string(),
    author: z.string().default('Jamie Chen, Shanghai-based Travel Writer'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };