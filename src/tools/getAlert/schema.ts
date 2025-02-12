import * as z from "zod";

export const getAlertSchema = z.object({
  stateCode: z.string().length(2).describe("Two-letter state code (e.g., CA, NY)"),
});

export type GetAlertSchema = z.infer<typeof getAlertSchema>;