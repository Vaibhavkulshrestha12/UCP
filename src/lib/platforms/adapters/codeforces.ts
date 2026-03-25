import { z } from "zod";
import { safeJsonFetch } from "@/lib/utils/fetcher";
import { normalizePlatformHandle } from "@/lib/platforms/handles";

const codeforcesUserSchema = z.object({
  status: z.literal("OK"),
  result: z.array(
    z.object({
      handle: z.string(),
      rank: z.string().nullable().optional(),
      rating: z.number().nullable().optional(),
      maxRank: z.string().nullable().optional(),
      maxRating: z.number().nullable().optional(),
      avatar: z.string().optional()
    })
  )
});

const codeforcesRatingSchema = z.object({
  status: z.literal("OK"),
  result: z.array(
    z.object({
      contestId: z.number(),
      contestName: z.string(),
      rank: z.number(),
      newRating: z.number(),
      oldRating: z.number()
    })
  )
});

const codeforcesStatusSchema = z.object({
  status: z.literal("OK"),
  result: z.array(
    z.object({
      id: z.number(),
      contestId: z.number().nullable().optional(),
      creationTimeSeconds: z.number(),
      programmingLanguage: z.string().optional(),
      verdict: z.string().nullable().optional(),
      timeConsumedMillis: z.number().nullable().optional(),
      memoryConsumedBytes: z.number().nullable().optional(),
      problem: z.object({
        contestId: z.number().nullable().optional(),
        index: z.string().optional(),
        name: z.string()
      })
    })
  )
});

const codeforcesContestSchema = z.object({
  status: z.literal("OK"),
  result: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      phase: z.string(),
      durationSeconds: z.number(),
      startTimeSeconds: z.number().optional()
    })
  )
});

const rankBands = [
  { min: 0, title: "Newbie", next: 1200 },
  { min: 1200, title: "Pupil", next: 1400 },
  { min: 1400, title: "Specialist", next: 1600 },
  { min: 1600, title: "Expert", next: 1900 },
  { min: 1900, title: "Candidate Master", next: 2100 },
  { min: 2100, title: "Master", next: 2300 },
  { min: 2300, title: "International Master", next: 2400 },
  { min: 2400, title: "Grandmaster", next: 2600 },
  { min: 2600, title: "International Grandmaster", next: 3000 },
  { min: 3000, title: "Legendary Grandmaster", next: null }
] as const;

function resolveNextRank(rating: number) {
  const current = [...rankBands].reverse().find((band) => rating >= band.min) ?? rankBands[0];
  return {
    badge: current.title,
    nextRank: current.next ? rankBands.find((band) => band.min === current.next)?.title ?? "Max" : "Max",
    toGo: current.next ? Math.max(current.next - rating, 0) : 0
  };
}

export async function verifyCodeforcesHandle(handle: string) {
  const normalizedHandle = normalizePlatformHandle("CODEFORCES", handle);
  const data = await safeJsonFetch<unknown>(
    `https://codeforces.com/api/user.info?handles=${encodeURIComponent(normalizedHandle)}`
  );

  const parsed = codeforcesUserSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  return parsed.data.result[0] ?? null;
}

export async function fetchCodeforcesSyncData(handle: string) {
  const normalizedHandle = normalizePlatformHandle("CODEFORCES", handle);
  const [userData, ratingData, statusData] = await Promise.all([
    safeJsonFetch<unknown>(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(normalizedHandle)}`),
    safeJsonFetch<unknown>(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(normalizedHandle)}`),
    safeJsonFetch<unknown>(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(normalizedHandle)}&from=1&count=20`
    )
  ]);

  const userParsed = codeforcesUserSchema.safeParse(userData);
  const ratingParsed = codeforcesRatingSchema.safeParse(ratingData);
  const statusParsed = codeforcesStatusSchema.safeParse(statusData);

  if (!userParsed.success) {
    return null;
  }

  const profile = userParsed.data.result[0];
  const rating = profile.rating ?? 0;
  const derived = resolveNextRank(rating);
  const history = ratingParsed.success ? ratingParsed.data.result : [];
  const submissions = statusParsed.success ? statusParsed.data.result : [];

  return {
    profile,
    hero: {
      rating,
      badge: profile.rank ?? derived.badge,
      nextRank: derived.nextRank,
      toGo: derived.toGo,
      maxRating: profile.maxRating ?? rating,
      currentRank: profile.rank ?? derived.badge,
      history
    },
    submissions,
    history
  };
}

export async function fetchUpcomingCodeforcesContests() {
  const data = await safeJsonFetch<unknown>("https://codeforces.com/api/contest.list?gym=false");
  const parsed = codeforcesContestSchema.safeParse(data);

  if (!parsed.success) {
    return [];
  }

  return parsed.data.result
    .filter((contest) => contest.phase === "BEFORE" && contest.startTimeSeconds)
    .slice(0, 8)
    .map((contest) => ({
      id: `codeforces-${contest.id}`,
      platform: "CODEFORCES" as const,
      externalId: String(contest.id),
      title: contest.name,
      slug: String(contest.id),
      division: contest.name.includes("Div.") ? contest.name.split("(").at(-1)?.replace(")", "").trim() ?? null : null,
      difficultyTag: null,
      startsAtUtc: new Date((contest.startTimeSeconds ?? 0) * 1000),
      durationMins: Math.round(contest.durationSeconds / 60),
      registrationUrl: `https://codeforces.com/contestRegistration/${contest.id}`,
      rawJson: contest
    }));
}
