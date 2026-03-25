"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase";

export function LoginActions() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function signInWithOtp() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase env vars are not configured. Set them to enable live auth.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setMessage(error ? error.message : "Magic link sent. Check your inbox.");
  }

  async function signInWithOAuth(provider: "google" | "github") {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase env vars are not configured. Set them to enable OAuth.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.url) {
      window.location.assign(data.url);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="operator@ucp.dev"
        className="w-full border border-white/10 bg-[#0e0e0e] px-4 py-4 text-sm text-white outline-none focus:border-white"
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={signInWithOtp}
          className="h-12 flex-1 bg-white px-6 text-sm font-extrabold uppercase tracking-[0.24em] text-black"
        >
          Email OTP
        </button>
        <button
          type="button"
          onClick={() => signInWithOAuth("google")}
          className="h-12 flex-1 border border-white/20 px-6 text-sm font-bold uppercase tracking-[0.2em] text-white"
        >
          Google OAuth
        </button>
        <button
          type="button"
          onClick={() => signInWithOAuth("github")}
          className="h-12 flex-1 border border-white/20 px-6 text-sm font-bold uppercase tracking-[0.2em] text-white"
        >
          GitHub OAuth
        </button>
      </div>

      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}
