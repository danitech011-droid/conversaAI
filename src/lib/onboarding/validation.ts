import { z } from "zod";

const urlSchema = z
  .string()
  .trim()
  .max(255)
  .refine(
    (value) => value === "" || /^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(value),
    "Enter a full URL starting with https://",
  );

export const organizationSchema = z.object({
  organizationName: z.string().trim().min(2, "Enter your organisation name").max(120),
  website: urlSchema,
  organizationSize: z.string(),
  country: z.string(),
});

export const industrySchema = z.object({
  industry: z.string().min(1, "Choose the option that fits best"),
});

export const goalsSchema = z.object({
  goals: z.array(z.string()).min(1, "Select at least one goal"),
});

export const aiSetupSchema = z.object({
  assistantName: z.string().trim().min(2, "Give your assistant a name").max(40),
  assistantRole: z.string().min(1),
  tone: z.string().min(1),
  welcomeMessage: z.string().trim().min(4, "Add a short welcome message").max(280),
  customInstructions: z.string().max(800),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}
