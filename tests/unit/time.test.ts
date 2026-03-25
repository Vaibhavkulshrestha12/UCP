import { deliveryKey, formatCountdown } from "@/lib/utils/time";

describe("time helpers", () => {
  it("builds stable delivery keys", () => {
    expect(deliveryKey(["Contest", "User_1", "T-24H"])).toBe("contest:user_1:t-24h");
  });

  it("formats future countdowns", () => {
    const now = new Date("2026-03-25T00:00:00.000Z");
    const target = new Date("2026-03-26T00:00:00.000Z");

    expect(formatCountdown(target, now)).toContain("1D");
  });

  it("marks live contests", () => {
    const now = new Date("2026-03-25T00:00:00.000Z");
    const target = new Date("2026-03-24T23:59:59.000Z");

    expect(formatCountdown(target, now)).toBe("LIVE");
  });
});
