"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGoogleLoginUrl, getToken, setToken } from "@/lib/auth";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
      return;
    }

    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-1 min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[hsl(221,83%,53%)]">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(221,83%,40%)] via-[hsl(221,83%,53%)] to-[hsl(250,80%,55%)]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-[15%] left-[10%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] h-96 w-96 rounded-full bg-white/[0.07] blur-3xl" />
        <div className="absolute top-[50%] right-[30%] h-48 w-48 rounded-full bg-white/[0.05] blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
                PF
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Personal Finance
              </span>
            </div>
          </div>

          <div className="max-w-lg">
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Take control of
              <br />
              <span className="text-white/90">your finances.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Track expenses, manage budgets, and build a healthier
              financial future — all in one place. Smart insights that
              help you save more and stress less.
            </p>

            {/* Value props */}
            <div className="mt-10 flex gap-10">
              <div>
                <div className="text-2xl font-bold">Track</div>
                <div className="mt-1 text-sm text-white/50">
                  Every expense
                </div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-bold">Budget</div>
                <div className="mt-1 text-sm text-white/50">
                  Smarter goals
                </div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-bold">Grow</div>
                <div className="mt-1 text-sm text-white/50">
                  Your savings
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Personal Finance. All rights
            reserved.
          </div>
        </div>
      </div>

      {/* Right Panel — Login */}
      <div className="flex w-full flex-col lg:w-[45%]">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 p-6 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-sm text-primary-foreground">
            PF
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Personal Finance
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 sm:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {/* Google Sign-in Button */}
            <a
              href={getGoogleLoginUrl()}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 text-sm font-medium text-card-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">
                  Secure authentication by Google
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  We use Google OAuth for secure, passwordless sign-in.
                  Your credentials are never stored on our servers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-3 w-3 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  End-to-end encrypted. Your data stays private and
                  protected at all times.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground/60">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
