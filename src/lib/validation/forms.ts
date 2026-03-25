import { z } from "zod";

const optionalHandleSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || value.length >= 2, {
    message: "Must be at least 2 characters when provided"
  });

export const onboardingSchema = z.object({
  displayName: z.string().trim().max(40).optional().default(""),
  leetcodeUsername: z.string().trim().min(2),
  codeforcesHandle: optionalHandleSchema,
  atcoderHandle: optionalHandleSchema,
  dailyProblemEnabled: z.boolean(),
  streakReminderEnabled: z.boolean(),
  contestReminderEnabled: z.boolean(),
  liveContestAlertEnabled: z.boolean(),
  sidebarShowcasePlatform: z.enum(["LEETCODE", "CODEFORCES", "ATCODER"]).default("LEETCODE"),
  solveTime: z.string().min(4),
  streakCheckTime: z.string().min(4),
  timezone: z.string().min(2)
});

export const settingsSchema = onboardingSchema;
