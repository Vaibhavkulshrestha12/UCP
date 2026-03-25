import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/auth/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

function getAuthDisplayName(authUser: User) {
  return (
    authUser.user_metadata.full_name ??
    authUser.user_metadata.name ??
    authUser.user_metadata.user_name ??
    authUser.user_metadata.preferred_username ??
    authUser.email?.split("@")[0] ??
    "User"
  );
}

export async function ensureUserProfile(authUser: User) {
  const authDisplayName = getAuthDisplayName(authUser);
  const existingProfile = await prisma.userProfile.findUnique({
    where: { authUserId: authUser.id }
  });

  if (!existingProfile) {
    return prisma.userProfile.create({
      data: {
        authUserId: authUser.id,
        email: authUser.email,
        displayName: authDisplayName,
        avatarUrl: authUser.user_metadata.avatar_url
      }
    });
  }

  return prisma.userProfile.update({
    where: { authUserId: authUser.id },
    data: {
      email: authUser.email,
      avatarUrl: authUser.user_metadata.avatar_url,
      displayName: existingProfile.displayNameEditedAt
        ? existingProfile.displayName
        : authDisplayName
    }
  });
}

export async function requireUserProfile() {
  const authUser = await requireCurrentUser();
  return ensureUserProfile(authUser);
}
