import { z } from "zod";

export const createAssetSchema = z.object({
  body: z.object({
    url: z.string().url(),
    type: z.string(),
    altText: z.string().optional(),
  }),
});
