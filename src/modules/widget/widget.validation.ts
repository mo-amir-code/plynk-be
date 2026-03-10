import { z } from "zod";
import { WidgetTypeName } from "../../generated/client/client";

const GRID_COLUMNS = 12;

export const createWidgetSchema = z.object({
  body: z
    .object({
      pageId: z.string().uuid(),
      type: z.nativeEnum(WidgetTypeName),
      x: z
        .number()
        .int()
        .min(0)
        .max(GRID_COLUMNS - 1),
      y: z.number().int().min(0),
      width: z.number().int().min(1).max(GRID_COLUMNS),
      height: z.number().int().min(1),
      config: z.object({
        data: z.record(z.string(), z.any()),
        options: z.record(z.string(), z.any()).optional(),
      }),
    })
    .refine((data) => data.x + data.width <= GRID_COLUMNS, {
      message: `Widget width exceeds grid limit of ${GRID_COLUMNS} columns`,
      path: ["width"],
    }),
});

export const updateWidgetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    x: z
      .number()
      .int()
      .min(0)
      .max(GRID_COLUMNS - 1)
      .optional(),
    y: z.number().int().min(0).optional(),
    width: z.number().int().min(1).max(GRID_COLUMNS).optional(),
    height: z.number().int().min(1).optional(),
    config: z
      .object({
        data: z.record(z.string(), z.any()).optional(),
        options: z.record(z.string(), z.any()).optional(),
      })
      .optional(),
  }),
});

export type CreateWidgetBody = z.infer<typeof createWidgetSchema>["body"];
export type UpdateWidgetBody = z.infer<typeof updateWidgetSchema>["body"];
