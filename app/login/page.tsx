"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Brand, Notice } from "@/components/ui";
import { registerLocalUser, signInLocalUser } from "@/lib/local-data";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInLocalUser(email, password);
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const name = String(data.get("fullName") ?? "").trim();
      const confirmation = String(data.get("confirmPassword") ?? "");
      if (password !== confirmation) {
        setError("The passwords do not match.");
        return;
      }
      if (password.length < 8) {
        setError("Choose a password with at least 8 characters.");
        return;
      }

      await registerLocalUser(name, email, password);
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-0 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-screen max-w-6xl overflow-hidden bg-white shadow-card sm:min-h-[min(780px,calc(100vh-40px))] sm:rounded-[28px] lg:grid-cols-[.92fr_1.08fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-10 text-white lg:flex xl:p-12">
          <div className="absolute -right-36 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-64 -right-48 h-[460px] w-[460px] rounded-full border border-white/10" />
          <Brand light />
          <div className="relative z-10 max-w-lg py-12">
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-100">YOUR JOURNEY, MADE SIMPLER</p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.12] tracking-tight">A clear path from application to passport.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-blue-50/85">Follow your application, check document progress, and keep your help requests together in one place.</p>
            <div className="mt-9 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">✓</span>
              <div><p className="text-sm font-semibold">One place for every update</p><p className="mt-1 text-xs text-blue-100/80">Your application at every step.</p></div>
            </div>
          </div>
          <p className="relative z-10 text-xs text-blue-100/70">MEMBER PORTAL · PASSTRACK</p>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><Brand /></div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-brand-600">{mode === "login" ? "MEMBER PORTAL" : "CREATE YOUR ACCOUNT"}</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">{mode === "login" ? "Welcome back" : "Create an account"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{mode === "login" ? "Sign in to continue to your dashboard." : "Set up your member account to get started."}</p>

            <div className="mt-6 space-y-3">
              {error ? <Notice>{error}</Notice> : null}
            </div>

            <form onSubmit={submit} className="mt-7 space-y-5">
              {mode === "register" ? (
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-xs font-semibold text-slate-700">Full name</label>
                  <input id="fullName" name="fullName" type="text" autoComplete="name" required minLength={2} placeholder="Your full name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </div>
              ) : null}
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-700">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold text-slate-700">Password</label>
                <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
              </div>
              {mode === "register" ? (
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-xs font-semibold text-slate-700">Confirm password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} placeholder="Enter your password again" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </div>
              ) : null}
              <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-blue-200">
                {busy ? (mode === "login" ? "Signing in…" : "Creating account…") : mode === "login" ? "Sign in" : "Create account"}
                {!busy ? <span aria-hidden="true">→</span> : null}
              </button>
            </form>

            <p className="mt-7 text-center text-xs text-slate-500">
              {mode === "login" ? "New to PASSTRACK?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
            <div className="mt-8"><Notice tone="info">Local demo only: accounts and data stay in this browser’s storage. This is not secure production authentication; do not use a real or reused password.</Notice></div>
          </div>
        </section>
      </div>
    </main>
  );
}
