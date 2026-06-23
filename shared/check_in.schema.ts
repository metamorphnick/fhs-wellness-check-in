import { z } from "zod";

export const check_in_payload_schema = z
  .object({
    time_of_visit: z.string().trim().min(1, "Time of visit is required."),
    first_visit: z.boolean(),
    reasons: z
      .array(z.string().trim().min(1, "Reasons cannot be blank."))
      .min(1, "At least one reason is required.")
      .refine((reasons) => new Set(reasons).size === reasons.length, {
        message: "Reasons must be unique."
      })
  })
  .strict();

export type CheckInPayload = z.infer<typeof check_in_payload_schema>;

export function validate_check_in_payload(payload: unknown): CheckInPayload {
  return check_in_payload_schema.parse(payload);
}
