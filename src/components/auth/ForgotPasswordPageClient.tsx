"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPageClient() {
  const [nip, setNip] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nip }),
      });

      const data = await res.json();
      setMessage(data.message || "Permintaan reset password diproses.");
      setResetUrl(data.resetUrl || "");
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan saat memproses permintaan reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.25),transparent_35%),linear-gradient(to_bottom,rgba(2,6,23,0.75),rgba(2,6,23,0.95))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[560px] rounded-[30px] border border-white/10 bg-white/8 p-6 text-white shadow-2xl md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-100/80">
            Bantuan Akses
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Reset Password
          </h1>
          <p className="mt-4 text-white/75">
            Masukkan NIP akunmu. Sistem akan menyiapkan tautan reset password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="nip"
                className="mb-2 block text-sm font-semibold text-white"
              >
                NIP
              </label>
              <input
                id="nip"
                type="text"
                value={nip}
                onChange={(event) => setNip(event.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/90 px-5 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Buat Tautan Reset"}
            </button>
          </form>

          {message ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-white/90">{message}</p>

              {resetUrl ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-50">
                    Tautan reset siap digunakan
                  </p>
                  <a
                    href={resetUrl}
                    className="mt-2 block break-all text-sm text-emerald-100 underline underline-offset-4"
                  >
                    {resetUrl}
                  </a>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-200 transition hover:text-white"
            >
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
