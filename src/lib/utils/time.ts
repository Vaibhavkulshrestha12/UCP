import { formatDistanceStrict } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export function formatCountdown(target: Date, now = new Date()) {
  if (target <= now) {
    return "LIVE";
  }

  const distance = formatDistanceStrict(target, now);
  return distance
    .replace(" hours", "H")
    .replace(" hour", "H")
    .replace(" minutes", "M")
    .replace(" minute", "M")
    .replace(" days", "D")
    .replace(" day", "D");
}

export function toUtcDate(date: Date) {
  return new Date(date.toISOString());
}

export function deliveryKey(parts: string[]) {
  return parts.join(":").toLowerCase();
}

export function getLocalDayRange(timezone: string, now = new Date()) {
  const zoned = toZonedTime(now, timezone);
  const start = new Date(zoned);
  start.setHours(0, 0, 0, 0);

  const end = new Date(zoned);
  end.setHours(23, 59, 59, 999);

  return {
    startUtc: fromZonedTime(start, timezone),
    endUtc: fromZonedTime(end, timezone)
  };
}
