import { z } from "zod";

export const createPageSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    themeId: z.string().uuid(),
  }),
});

export const updatePageSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    themeId: z.string().uuid().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export type CreatePageBody = z.infer<typeof createPageSchema>["body"];
export type UpdatePageBody = z.infer<typeof updatePageSchema>["body"];
