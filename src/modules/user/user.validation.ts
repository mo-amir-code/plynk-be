import { z } from "zod";

export const contactFormSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(2, "Subject must be at least 2 characters"),
    message: z.string().min(5, "Message must be at least 5 characters"),
  }),
});
