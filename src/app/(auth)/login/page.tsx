import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/app-shell/logo-mark";
import { LoginActions } from "@/components/auth/login-actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="rounded-full border border-white/15 bg-white/5 p-2">
                <LogoMark className="h-10 w-10" />
              </div>
              <p className="font-display text-xl font-bold uppercase tracking-tight">UNIFIED CODING PLATFORM</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Secure Access</p>
              <h1 className="mt-4 font-display text-6xl font-bold uppercase leading-none tracking-tight">
                Enter The Ops Layer.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">
                Sign in with email OTP, Google OAuth, or GitHub OAuth. Auth is powered by
                Supabase; all platform data, preferences, schedules, and snapshots remain in your
                application database.
              </p>
            </div>
          </div>

          <div className="panel p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Authentication</p>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight">
              Login
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Use the configured auth providers. Sessions are handled by Supabase and synced into
              the application database after callback completion.
            </p>
            <div className="mt-8">
              <LoginActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
