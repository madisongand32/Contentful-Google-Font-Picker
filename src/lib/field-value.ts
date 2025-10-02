import { z } from "zod";

// Base font object schema
export const FontSchema = z.object({
  family: z.string().min(1, "Family name cannot be empty"),
  googleUrl: z.string().min(1, "Google URL cannot be empty"),
});

// Schema for font field values (can be null when no font selected)
export const FontFieldSchema = FontSchema.nullable();

export type FontFieldValue = z.infer<typeof FontFieldSchema>;
