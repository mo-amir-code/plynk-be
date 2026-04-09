import { z } from "zod";
import { ThemeType } from "../../generated/client/client";

export const createThemeSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.nativeEnum(ThemeType),
    description: z.string().min(1),
    styleConfig: z.record(z.string(), z.any()),
  }),
});

export const updateThemeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().optional(),
    type: z.nativeEnum(ThemeType).optional(),
    description: z.string().optional(),
    styleConfig: z.record(z.string(), z.any()).optional(),
  }),
});

