import { z } from "zod";
import { WidgetType } from "../../generated/client/client";

const GRID_COLUMNS = 12;

export const createWidgetSchema = z.object({
  body: z
    .object({
      pageId: z.string().uuid(),
      type: z.nativeEnum(WidgetType),
      handle: z.string(),
      fullURL: z.string().url(),
      startCol: z
        .number()
        .int()
        .min(0)
        .max(GRID_COLUMNS - 1),
      startRow: z.number().int().min(0),
      colSize: z.number().int().min(1).max(GRID_COLUMNS),
      rowSize: z.number().int().min(1),
      icon: z.string().url().optional(),
      config: z.object({
        data: z.record(z.string(), z.any()),
        options: z.record(z.string(), z.any()).optional(),
      }),
    })
    .refine((data) => data.startCol + data.colSize <= GRID_COLUMNS, {
      message: `Widget width exceeds grid limit of ${GRID_COLUMNS} columns`,
      path: ["colSize"],
    }),
});

export const updateWidgetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    handle: z.string().optional(),
    fullURL: z.string().url().optional(),
    startCol: z
      .number()
      .int()
      .min(0)
      .max(GRID_COLUMNS - 1)
      .optional(),
    startRow: z.number().int().min(0).optional(),
    colSize: z.number().int().min(1).max(GRID_COLUMNS).optional(),
    rowSize: z.number().int().min(1).optional(),
    icon: z.string().url().optional(),
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
