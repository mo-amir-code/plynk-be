import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().optional(),
    tnc: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  }),
});

export const claimUsernameSchema = z.object({
  body: z.object({
    username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/, "Invalid username format"),
  }),
});

export const checkUsernameSchema = z.object({
  params: z.object({
    username: z.string().min(3),
  }),
});

export type LoginBody = z.infer<typeof loginSchema>["body"];
export type RegisterBody = z.infer<typeof registerSchema>["body"];
