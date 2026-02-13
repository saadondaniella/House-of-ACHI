import { defineCollection, z } from "astro:content";

const cases = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().optional(),
    featured: z.boolean().optional(),
    cover: z.string().optional(),
  }),
});

export const collections = { cases };
