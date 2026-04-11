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

export const syncPageSchema = z.object({
  body: z.object({
    themeId: z.string().uuid().optional(),
    themeConfig: z.record(z.string(), z.any()).optional(),
    isPublished: z.boolean().optional(),
    widgets: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          type: z.string().optional(),
          handle: z.string().optional(),
          fullURL: z.string().optional(),
          startCol: z.number().int(),
          startRow: z.number().int(),
          colSize: z.number().int(),
          rowSize: z.number().int(),
          config: z.record(z.string(), z.any()).optional(),
        }),
      )
      .max(50)
      .optional(),
  }),
});

export type CreatePageBody = z.infer<typeof createPageSchema>["body"];
export type UpdatePageBody = z.infer<typeof updatePageSchema>["body"];
export type SyncPageBody = z.infer<typeof syncPageSchema>["body"];

