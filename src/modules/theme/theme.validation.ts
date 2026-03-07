import { z } from "zod";

export const updateThemeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    styleConfig: z
      .object({
        page: z.record(z.string(), z.any()),
        widgetDefault: z.record(z.string(), z.any()),
        widgetStyles: z.record(z.string(), z.any()),
      })
      .optional(),
  }),
});
