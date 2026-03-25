import { onboardingSchema } from "@/lib/validation/forms";

describe("onboarding schema", () => {
  it("accepts a complete onboarding payload", () => {
    const parsed = onboardingSchema.parse({
      leetcodeUsername: "architect_01",
      codeforcesHandle: "tourist",
      atcoderHandle: "chokudai",
      dailyProblemEnabled: true,
      streakReminderEnabled: true,
      contestReminderEnabled: true,
      liveContestAlertEnabled: false,
      solveTime: "20:00",
      streakCheckTime: "22:30",
      timezone: "Asia/Kolkata"
    });

    expect(parsed.leetcodeUsername).toBe("architect_01");
    expect(parsed.timezone).toBe("Asia/Kolkata");
  });
});
