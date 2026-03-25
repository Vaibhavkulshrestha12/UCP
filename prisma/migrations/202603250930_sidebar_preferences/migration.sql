ALTER TABLE "UserProfile"
ADD COLUMN "displayNameEditedAt" TIMESTAMP(3);

ALTER TABLE "UserPreference"
ADD COLUMN "sidebarShowcasePlatform" "Platform" NOT NULL DEFAULT 'LEETCODE';
