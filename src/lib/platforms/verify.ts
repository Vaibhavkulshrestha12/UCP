import { verifyAtCoderHandle } from "@/lib/platforms/adapters/atcoder";
import { verifyCodeforcesHandle } from "@/lib/platforms/adapters/codeforces";
import { verifyLeetCodeHandle } from "@/lib/platforms/adapters/leetcode";

export async function verifyAllHandles(input: {
  leetcodeUsername: string;
  codeforcesHandle: string;
  atcoderHandle: string;
}) {
  const [leetcode, codeforces, atcoder] = await Promise.all([
    verifyLeetCodeHandle(input.leetcodeUsername),
    input.codeforcesHandle ? verifyCodeforcesHandle(input.codeforcesHandle) : Promise.resolve(null),
    input.atcoderHandle ? verifyAtCoderHandle(input.atcoderHandle) : Promise.resolve(null)
  ]);

  return {
    leetcode,
    codeforces,
    atcoder
  };
}
