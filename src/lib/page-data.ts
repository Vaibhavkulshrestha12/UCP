import type { Platform, SubmissionEvent } from "@prisma/client";
import { requireUserProfile } from "@/lib/auth/session";
import {
  getContests,
  getDailyChallenge,
  getOrCreatePreference,
  getPlatformAccounts,
  getSnapshots,
  getSubmissionHistory,
  getSubmissions
} from "@/lib/data";
import { formatCountdown } from "@/lib/utils/time";

function toSnapshotMap(
  snapshots: Array<{ snapshotType: string; payload: unknown }>
) {
  return Object.fromEntries(snapshots.map((snapshot) => [snapshot.snapshotType, snapshot.payload]));
}

function toLocalDayKey(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(date);
}

function getAcceptedDayKeys(submissions: SubmissionEvent[], timezone: string) {
  return Array.from(
    new Set(
      submissions
        .filter((submission) => submission.verdict.includes("AC"))
        .map((submission) => toLocalDayKey(submission.submittedAtUtc, timezone))
    )
  ).sort();
}

function computeStreakMetrics(submissions: SubmissionEvent[], timezone: string) {
  const acceptedDays = new Set(getAcceptedDayKeys(submissions, timezone));
  const today = new Date();
  let current = 0;

  for (let offset = 0; ; offset += 1) {
    const candidate = new Date(today);
    candidate.setDate(candidate.getDate() - offset);
    if (!acceptedDays.has(toLocalDayKey(candidate, timezone))) {
      break;
    }
    current += 1;
  }

  const sortedDays = [...acceptedDays];
  let peak = 0;
  let running = 0;
  let previousDay: Date | null = null;

  for (const day of sortedDays) {
    const currentDay = new Date(`${day}T00:00:00`);
    if (!previousDay) {
      running = 1;
    } else {
      const diffDays = Math.round((currentDay.getTime() - previousDay.getTime()) / 86400000);
      running = diffDays === 1 ? running + 1 : 1;
    }

    peak = Math.max(peak, running);
    previousDay = currentDay;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    current,
    peak,
    activeToday: acceptedDays.has(toLocalDayKey(today, timezone)),
    wasActiveYesterday: acceptedDays.has(toLocalDayKey(yesterday, timezone))
  };
}

function buildHeatmapActive(submissions: SubmissionEvent[], timezone: string, rows: number, columns: number) {
  const acceptedDays = new Set(getAcceptedDayKeys(submissions, timezone));
  const total = rows * columns;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (total - 1));

  const active: number[] = [];

  for (let index = 0; index < total; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    if (acceptedDays.has(toLocalDayKey(day, timezone))) {
      active.push(index);
    }
  }

  return active;
}

function buildContributionHeatmap(submissions: SubmissionEvent[], timezone: string, weeks = 53) {
  const rows = 7;
  const total = rows * weeks;
  const counts = new Map<string, number>();

  for (const submission of submissions) {
    const key = toLocalDayKey(submission.submittedAtUtc, timezone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (total - 1));

  const dayCounts: number[] = [];
  const monthLabels: string[] = [];
  const activeDays = new Set<string>();
  let totalSubmissions = 0;
  let peakDay = 0;

  for (let column = 0; column < weeks; column += 1) {
    const firstDayOfColumn = new Date(start);
    firstDayOfColumn.setDate(start.getDate() + column * rows);
    monthLabels.push(
      firstDayOfColumn.getDate() <= 7
        ? firstDayOfColumn.toLocaleString("en-US", { month: "short" })
        : ""
    );

    for (let row = 0; row < rows; row += 1) {
      const currentDay = new Date(firstDayOfColumn);
      currentDay.setDate(firstDayOfColumn.getDate() + row);
      const key = toLocalDayKey(currentDay, timezone);
      const count = counts.get(key) ?? 0;
      dayCounts.push(count);
      totalSubmissions += count;
      peakDay = Math.max(peakDay, count);
      if (count > 0) {
        activeDays.add(key);
      }
    }
  }

  const levels = dayCounts.map((count) => {
    if (count === 0) return 0;
    if (peakDay <= 1) return 4;
    const normalized = count / peakDay;
    if (normalized >= 0.75) return 4;
    if (normalized >= 0.5) return 3;
    if (normalized >= 0.25) return 2;
    return 1;
  });

  return {
    rows,
    columns: weeks,
    levels,
    monthLabels,
    totalSubmissions,
    activeDays: activeDays.size,
    peakDay
  };
}

function getSidebarMetric(
  platform: Platform,
  heroByPlatform: Partial<Record<Platform, Record<string, unknown>>>,
  accounts: Array<{ platform: Platform; verified: boolean }>
) {
  const linked = accounts.find((account) => account.platform === platform && account.verified);
  const hero = heroByPlatform[platform] ?? {};

  if (!linked) {
    return {
      platform,
      label: `${platform.toLowerCase()} not linked`,
      value: "Not linked"
    };
  }

  if (platform === "LEETCODE") {
    const contestRating =
      typeof hero.contestRating === "number" && hero.contestRating > 0 ? `RT ${hero.contestRating}` : null;
    const ranking = typeof hero.ranking === "number" ? `#${hero.ranking}` : null;
    const solved = typeof hero.solved === "number" ? `${hero.solved} solved` : null;
    return {
      platform,
      label: "LeetCode",
      value: contestRating ?? ranking ?? solved ?? "No sync yet"
    };
  }

  if (platform === "CODEFORCES") {
    return {
      platform,
      label: "Codeforces",
      value: typeof hero.rating === "number" && hero.rating > 0 ? String(hero.rating) : "No sync yet"
    };
  }

  return {
    platform,
    label: "AtCoder",
    value: typeof hero.rating === "number" && hero.rating > 0 ? String(hero.rating) : "No sync yet"
  };
}

async function getCommonProfileData() {
  const profile = await requireUserProfile();
  const [preference, accounts, snapshots, submissions] = await Promise.all([
    getOrCreatePreference(profile.id, profile.timezone),
    getPlatformAccounts(profile.id),
    getSnapshots(profile.id),
    getSubmissionHistory(profile.id)
  ]);

  const heroByPlatform = Object.fromEntries(
    snapshots
      .filter((snapshot) => snapshot.snapshotType === "hero")
      .map((snapshot) => [snapshot.platform, snapshot.payload as Record<string, unknown>])
  ) as Partial<Record<Platform, Record<string, unknown>>>;
  const streak = computeStreakMetrics(submissions, profile.timezone);

  return {
    profile,
    preference,
    accounts,
    snapshots,
    submissions,
    heroByPlatform,
    streak
  };
}

export async function getSidebarData() {
  const { profile, preference, accounts, heroByPlatform, streak } = await getCommonProfileData();
  const sidebarMetric = getSidebarMetric(preference.sidebarShowcasePlatform, heroByPlatform, accounts);

  return {
    profile,
    preference,
    sidebarMetric,
    linkedPlatformCount: accounts.filter((account) => account.verified).length,
    isStreakAtRisk: preference.streakReminder && !streak.activeToday && streak.wasActiveYesterday
  };
}

export async function getDashboardData() {
  const { profile, preference, accounts, snapshots, submissions, heroByPlatform, streak } =
    await getCommonProfileData();
  const [contests, dailyChallenge, leetcodeSubmissionHistory] = await Promise.all([
    getContests(),
    getDailyChallenge(profile.id),
    getSubmissionHistory(profile.id, "LEETCODE", 400)
  ]);
  const contributionHeatmap = buildContributionHeatmap(leetcodeSubmissionHistory, profile.timezone);

  return {
    profile,
    preference,
    accounts,
    contests: contests.map((contest) => ({
      ...contest,
      countdownLabel: formatCountdown(contest.startsAtUtc)
    })),
    snapshots,
    heroByPlatform,
    snapshotMap: toSnapshotMap(snapshots),
    dailyChallenge,
    streak,
    heatmapActive: buildHeatmapActive(submissions, profile.timezone, 7, 12),
    contributionHeatmap
  };
}

export async function getPlatformData(platform: Platform) {
  const profile = await requireUserProfile();
  const [preference, contests, snapshots, submissions, accounts, dailyChallenge, submissionHistory] =
    await Promise.all([
      getOrCreatePreference(profile.id, profile.timezone),
      getContests(platform),
      getSnapshots(profile.id, platform),
      getSubmissions(profile.id, platform),
      getPlatformAccounts(profile.id),
      platform === "LEETCODE" ? getDailyChallenge(profile.id) : Promise.resolve(null),
      getSubmissionHistory(profile.id, platform)
    ]);

  const account = accounts.find((entry) => entry.platform === platform) ?? null;

  return {
    profile,
    preference,
    account,
    contests,
    snapshots,
    snapshotMap: toSnapshotMap(snapshots),
    submissions,
    dailyChallenge,
    streak: computeStreakMetrics(submissionHistory, profile.timezone),
    heatmapActive: buildHeatmapActive(
      submissionHistory,
      profile.timezone,
      platform === "CODEFORCES" ? 3 : 7,
      platform === "ATCODER" ? 34 : 12
    )
  };
}

export async function getSettingsData() {
  const profile = await requireUserProfile();
  const [preference, accounts] = await Promise.all([
    getOrCreatePreference(profile.id, profile.timezone),
    getPlatformAccounts(profile.id)
  ]);

  return {
    profile,
    preference,
    accounts,
    canEditDisplayName: !profile.displayNameEditedAt
  };
}
