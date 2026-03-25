import type { Platform } from "@prisma/client";

function toUrlCandidate(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) {
    return `https://${value}`;
  }

  return null;
}

function parseUrl(value: string) {
  const candidate = toUrlCandidate(value);
  if (!candidate) {
    return null;
  }

  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function cleanRawHandle(value: string) {
  return value.trim().replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
}

export function normalizePlatformHandle(platform: Platform, value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const url = parseUrl(trimmed);
  if (!url) {
    return cleanRawHandle(trimmed);
  }

  const segments = url.pathname.split("/").filter(Boolean);

  if (platform === "LEETCODE") {
    const userIndex = segments.findIndex((segment) => segment.toLowerCase() === "u");
    if (userIndex >= 0 && segments[userIndex + 1]) {
      return cleanRawHandle(segments[userIndex + 1]);
    }
  }

  if (platform === "CODEFORCES") {
    const profileIndex = segments.findIndex((segment) => segment.toLowerCase() === "profile");
    if (profileIndex >= 0 && segments[profileIndex + 1]) {
      return cleanRawHandle(segments[profileIndex + 1]);
    }
  }

  if (platform === "ATCODER") {
    const usersIndex = segments.findIndex((segment) => segment.toLowerCase() === "users");
    if (usersIndex >= 0 && segments[usersIndex + 1]) {
      return cleanRawHandle(segments[usersIndex + 1]);
    }
  }

  return cleanRawHandle(segments.at(-1) ?? trimmed);
}
