import type {
  Contest,
  DailyChallengeSnapshot,
  Platform,
  PlatformSnapshot,
  SubmissionEvent,
  UserPreference,
  UserProfile
} from "@prisma/client";

export type DashboardContestCard = {
  id: string;
  platform: Platform;
  title: string;
  startsAtLabel: string;
  countdownLabel: string;
  division?: string | null;
  accent?: "warning" | "muted" | "danger";
};

export type DashboardPageData = {
  profile: Pick<UserProfile, "displayName" | "timezone"> & { rankLabel: string };
  preference: UserPreference;
  overview: {
    leetcodeSolved: string;
    codeforcesRating: string;
    codeforcesRank: string;
    atcoderRating: string;
    atcoderNextRank: string;
    streakLabel: string;
    nextContestLabel: string;
  };
  dailyChallenge: DailyChallengeSnapshot | null;
  contests: DashboardContestCard[];
  snapshots: PlatformSnapshot[];
};

export type PlatformPageData = {
  profile: Pick<UserProfile, "displayName" | "timezone"> & { rankLabel: string };
  preference: UserPreference;
  heroSnapshot?: PlatformSnapshot | null;
  contests: Contest[];
  submissions: SubmissionEvent[];
  snapshots: PlatformSnapshot[];
  dailyChallenge?: DailyChallengeSnapshot | null;
};
