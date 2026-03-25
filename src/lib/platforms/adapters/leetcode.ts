import { z } from "zod";
import { normalizePlatformHandle } from "@/lib/platforms/handles";

const matchedUserSchema = z.object({
  data: z.object({
    matchedUser: z
      .object({
        username: z.string(),
        submitStats: z
          .object({
            acSubmissionNum: z.array(
              z.object({
                difficulty: z.string(),
                count: z.number()
              })
            )
          })
          .optional(),
        profile: z
          .object({
            ranking: z.number().nullable().optional()
          })
          .optional()
      })
      .nullable()
  })
});

const dailyChallengeSchema = z.object({
  data: z.object({
    activeDailyCodingChallengeQuestion: z
      .object({
        date: z.string(),
        userStatus: z.string().nullable().optional(),
        link: z.string(),
        question: z.object({
          title: z.string(),
          titleSlug: z.string(),
          difficulty: z.string(),
          acRate: z.number().nullable().optional()
        })
      })
      .nullable()
  })
});

const userContestRankingSchema = z.object({
  data: z.object({
    userContestRanking: z
      .object({
        rating: z.number().nullable().optional(),
        globalRanking: z.number().nullable().optional(),
        attendedContestsCount: z.number().nullable().optional(),
        topPercentage: z.number().nullable().optional()
      })
      .nullable()
  })
});

const recentSubmissionSchema = z.object({
  data: z.object({
    recentSubmissionList: z
      .array(
        z.object({
          title: z.string(),
          titleSlug: z.string(),
          timestamp: z.string(),
          statusDisplay: z.string(),
          lang: z.string().nullable().optional(),
          runtime: z.string().nullable().optional(),
          memory: z.string().nullable().optional()
        })
      )
      .nullable()
  })
});

async function leetCodeGraphql<T>(query: string, variables?: Record<string, unknown>) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables
    }),
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function verifyLeetCodeHandle(username: string) {
  const normalizedUsername = normalizePlatformHandle("LEETCODE", username);
  const data = await leetCodeGraphql<unknown>(
    `
      query matchedUser($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `,
    { username: normalizedUsername }
  );

  const parsed = matchedUserSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  return parsed.data.data.matchedUser;
}

export async function fetchLeetCodeSyncData(username: string) {
  const normalizedUsername = normalizePlatformHandle("LEETCODE", username);
  const [profileData, dailyData, submissionData, contestRankingData] = await Promise.all([
    leetCodeGraphql<unknown>(
      `
        query matchedUser($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      { username: normalizedUsername }
    ),
    leetCodeGraphql<unknown>(
      `
        query questionOfToday {
          activeDailyCodingChallengeQuestion {
            date
            userStatus
            link
            question {
              title
              titleSlug
              difficulty
              acRate
            }
          }
        }
      `
    ),
    leetCodeGraphql<unknown>(
      `
        query recentSubmissionList($username: String!) {
          recentSubmissionList(username: $username) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
            runtime
            memory
          }
        }
      `,
      { username: normalizedUsername }
    ),
    leetCodeGraphql<unknown>(
      `
        query userContestRankingInfo($username: String!) {
          userContestRanking(username: $username) {
            rating
            globalRanking
            attendedContestsCount
            topPercentage
          }
        }
      `,
      { username: normalizedUsername }
    )
  ]);

  const profileParsed = matchedUserSchema.safeParse(profileData);
  if (!profileParsed.success || !profileParsed.data.data.matchedUser) {
    return null;
  }

  const profile = profileParsed.data.data.matchedUser;
  const dailyParsed = dailyChallengeSchema.safeParse(dailyData);
  const submissionParsed = recentSubmissionSchema.safeParse(submissionData);
  const contestRankingParsed = userContestRankingSchema.safeParse(contestRankingData);
  const contestRanking = contestRankingParsed.success
    ? contestRankingParsed.data.data.userContestRanking
    : null;

  const totals =
    profile.submitStats?.acSubmissionNum.reduce<Record<string, number>>((accumulator, entry) => {
      accumulator[entry.difficulty.toLowerCase()] = entry.count;
      return accumulator;
    }, {}) ?? {};

  return {
    profile,
    hero: {
      solved:
        (totals.easy ?? 0) +
        (totals.medium ?? 0) +
        (totals.hard ?? 0),
      easy: totals.easy ?? 0,
      medium: totals.medium ?? 0,
      hard: totals.hard ?? 0,
      ranking: profile.profile?.ranking ?? null,
      contestRating: contestRanking?.rating ? Math.round(contestRanking.rating) : null,
      contestGlobalRanking: contestRanking?.globalRanking ?? null,
      attendedContestsCount: contestRanking?.attendedContestsCount ?? 0,
      topPercentage:
        contestRanking?.topPercentage !== null && contestRanking?.topPercentage !== undefined
          ? Number(contestRanking.topPercentage.toFixed(2))
          : null
    },
    dailyChallenge: dailyParsed.success ? dailyParsed.data.data.activeDailyCodingChallengeQuestion : null,
    submissions: submissionParsed.success ? submissionParsed.data.data.recentSubmissionList ?? [] : []
  };
}
