import { z } from "zod";

export const crashBetSchema = z.object({
  betAmount: z
    .string()
    .min(1, "Bet amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Bet must be a number greater than 0",
    })
    .transform((val) => Number(val)),

  autoCashout: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? Number(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val > 1), {
      message: "Auto cashout must be a number greater than 1x",
    }),
});