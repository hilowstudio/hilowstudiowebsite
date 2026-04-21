"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OpsLoginPage() {
  return (
    <Suspense fallback={null}>
      <OpsLogin />
    </Suspense>
  );
}

function OpsLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/ops/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const rawNext = searchParams.get("next");
      const next =
        rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
          ? rawNext
          : "/app";
      router.push(next);
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm p-8">
        <h1 className="font-serif text-2xl text-ink mb-2">Hi Low Ops</h1>
        <p className="text-ink-muted text-sm mb-8">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoFocus
            required
            className="w-full px-4 py-3 rounded-md border border-paper-muted bg-paper-warm text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay text-sm"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-md border border-paper-muted bg-paper-warm text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-clay text-sm"
          />

          {error && <p className="text-terracotta text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full px-4 py-3 rounded-md bg-ink text-paper text-sm font-medium hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
