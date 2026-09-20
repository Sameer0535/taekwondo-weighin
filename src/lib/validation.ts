import { z } from "zod";

export const ParticipantSchema = z.object({
  lotNumber: z
    .string()
    .trim()
    .optional()
    .nullable(),
  athleteName: z
    .string()
    .min(2, "Athlete Name must be at least 2 characters")
    .max(100, "Athlete Name must not exceed 100 characters")
    .trim(),
  academyName: z
    .string()
    .min(2, "Academy / Club Name must be at least 2 characters")
    .max(120, "Academy Name must not exceed 120 characters")
    .trim(),
  country: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "Male", "Female"]).transform((val) => val.toUpperCase()),
  division: z.string().min(1, "Division is required").trim(),
  ageGroup: z.string().min(1, "Age Group is required").trim(),
  category: z.string().default("Kyorugi"),
  weightCategory: z.string().min(1, "Weight Category is required").trim(),
  athleteId: z.string().trim().optional().nullable(),
});

export const ParticipantUpdateSchema = ParticipantSchema.partial();

export const WeighInRecordSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(10.0, "Weight must be at least 10.00 KG")
    .max(200.0, "Weight must not exceed 200.00 KG"),
  status: z.enum(["PASSED", "HOLD", "REJECTED"], {
    errorMap: () => ({ message: "Status must be PASSED, HOLD, or REJECTED" }),
  }),
  operatorId: z.string().default("OP-01"),
  notes: z.string().max(300).optional().nullable(),
});

export const BulkImportRowSchema = z.object({
  lotNumber: z.string().optional().nullable(),
  athleteName: z.string().min(2, "Athlete Name too short"),
  academyName: z.string().min(2, "Academy Name too short"),
  gender: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .refine((v) => v === "MALE" || v === "FEMALE", {
      message: "Gender must be Male or Female",
    }),
  division: z.string().min(1, "Missing Division"),
  ageGroup: z.string().min(1, "Missing Age Group"),
  category: z.string().default("Kyorugi"),
  weightCategory: z.string().min(1, "Missing Weight Category"),
  athleteId: z.string().optional(),
});

export type ParticipantInput = z.infer<typeof ParticipantSchema>;
export type WeighInRecordInput = z.infer<typeof WeighInRecordSchema>;
