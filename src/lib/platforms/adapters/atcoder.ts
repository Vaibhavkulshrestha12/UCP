import { safeJsonFetch } from "@/lib/utils/fetcher";
import { normalizePlatformHandle } from "@/lib/platforms/handles";

type AtCoderSubmission = {
  id: number;
  epoch_second: number;
  problem_id: string;
  result: string;
  language?: string;
};

type AtCoderContest = {
  id: string;
  title: string;
  start_epoch_second: number;
  duration_second: number;
  rate_change?: string;
};

function extractProfileValue(html: string, label: string) {
  const pattern = new RegExp(
    `<tr><th[^>]*>${label}<\\/th><td>(?:<span[^>]*>)?([^<]+)`,
    "i"
  );

  return html.match(pattern)?.[1]?.trim() ?? null;
}

function extractRankHistory(html: string) {
  const match = html.match(/var rank_history=(\[.*?\]);<\/script>/s);
  if (!match) {
    return [];
  }

  try {
    return JSON.parse(match[1]) as Array<{
      ContestName: string;
      ContestUrl: string;
      EndTime: number;
      Rank: number;
      Rating: number;
      Competed: boolean;
    }>;
  } catch {
    return [];
  }
}

function ratingBand(rating: number) {
  if (rating >= 2800) return "Red";
  if (rating >= 2400) return "Orange";
  if (rating >= 2000) return "Yellow";
  if (rating >= 1600) return "Blue";
  if (rating >= 1200) return "Cyan";
  if (rating >= 800) return "Green";
  if (rating >= 400) return "Brown";
  return "Gray";
}

export async function verifyAtCoderHandle(handle: string) {
  const normalizedHandle = normalizePlatformHandle("ATCODER", handle);
  const profileResponse = await fetch(`https://atcoder.jp/users/${normalizedHandle}`, {
    next: { revalidate: 300 }
  });

  if (!profileResponse.ok) {
    return null;
  }

  const html = await profileResponse.text();
  if (html.includes("404 Not Found")) {
    return null;
  }

  const submissions = await safeJsonFetch<unknown[]>(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(normalizedHandle)}&from_second=0`
  );

  return {
    handle: normalizedHandle,
    hasSubmissions: Array.isArray(submissions) && submissions.length > 0
  };
}

export async function fetchAtCoderSyncData(handle: string) {
  const normalizedHandle = normalizePlatformHandle("ATCODER", handle);
  const profileResponse = await fetch(`https://atcoder.jp/users/${normalizedHandle}`, {
    next: { revalidate: 300 }
  });

  if (!profileResponse.ok) {
    return null;
  }

  const html = await profileResponse.text();
  if (html.includes("404 Not Found")) {
    return null;
  }

  const submissions =
    (await safeJsonFetch<AtCoderSubmission[]>(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(normalizedHandle)}&from_second=0`
    )) ?? [];

  const history = extractRankHistory(html);
  const rating = Number.parseInt(extractProfileValue(html, "Rating") ?? "0", 10) || 0;
  const rank = extractProfileValue(html, "Rank");
  const highestRating = Number.parseInt(extractProfileValue(html, "Highest Rating") ?? "0", 10) || rating;
  const ratedMatches = Number.parseInt(extractProfileValue(html, "Rated Matches") ?? "0", 10) || 0;
  const acceptedCount = submissions.filter((submission) => submission.result === "AC").length;
  const peakRank = history.length
    ? history.reduce((best, entry) => Math.min(best, entry.Rank), Number.MAX_SAFE_INTEGER)
    : null;

  return {
    profile: {
      handle: normalizedHandle,
      rank,
      rating,
      highestRating,
      ratedMatches
    },
    hero: {
      rating,
      status: ratingBand(rating),
      globalRank: rank ?? "Unranked",
      highestRating,
      ratedMatches,
      acceptedCount,
      peakRank
    },
    submissions,
    history
  };
}

export async function fetchUpcomingAtCoderContests() {
  const contests =
    (await safeJsonFetch<AtCoderContest[]>("https://kenkoooo.com/atcoder/resources/contests.json")) ?? [];

  return contests
    .filter((contest) => contest.start_epoch_second * 1000 > Date.now())
    .slice(0, 8)
    .map((contest) => ({
      id: `atcoder-${contest.id}`,
      platform: "ATCODER" as const,
      externalId: contest.id,
      title: contest.title,
      slug: contest.id,
      division: contest.title.match(/\b(ABC|ARC|AGC)\b/i)?.[0] ?? null,
      difficultyTag: contest.rate_change ?? null,
      startsAtUtc: new Date(contest.start_epoch_second * 1000),
      durationMins: Math.round(contest.duration_second / 60),
      registrationUrl: `https://atcoder.jp/contests/${contest.id}`,
      rawJson: contest
    }));
}
