"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login gagal");
        setLoading(false);
        return;
      }

      const redirectTo =
        data?.redirect ||
        (data?.user?.role === "ADMIN"
          ? "/dashboard/admin"
          : "/dashboard/user");

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/login-bg.jpg')",
        }}
      />

      {/* Overlay biar tulisan lebih kebaca */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[520px] rounded-[30px] border border-white/20 bg-white/12 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-white/80 md:text-sm">
              Sistem Internal
            </p>

            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Lembar Kerja
            </h1>

            <h2 className="mt-1 text-3xl font-extrabold leading-tight text-emerald-400 md:text-4xl">
              Perbaikan Alat
            </h2>

            <p className="mt-5 text-base text-white/90 md:text-lg">
              Silakan masuk menggunakan email dan password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-lg font-semibold text-white"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-14 w-full rounded-2xl border border-white/20 bg-white/85 px-5 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-lg font-semibold text-white"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="h-14 w-full rounded-2xl border border-white/20 bg-white/85 px-5 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-500/90 px-4 py-3 text-sm font-medium text-white">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}