import { z } from "zod";

export const createPageSchema = z.object({
  body: z.object({
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
  }),
});

export const updatePageSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    title: z.string().min(1).optional(),
    themeId: z.string().uuid().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export type CreatePageBody = z.infer<typeof createPageSchema>["body"];
export type UpdatePageBody = z.infer<typeof updatePageSchema>["body"];
