"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ResetPasswordPageClientProps = {
  token: string;
};

export default function ResetPasswordPageClient({
  token,
}: ResetPasswordPageClientProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset password gagal.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Password berhasil direset.");
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_32%),linear-gradient(to_bottom,rgba(2,6,23,0.78),rgba(2,6,23,0.96))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[560px] rounded-[30px] border border-white/10 bg-white/8 p-6 text-white shadow-2xl md:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-100/80">
            Bantuan Akses
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Buat Password Baru
          </h1>
          <p className="mt-4 text-white/75">
            Gunakan password baru yang kuat agar akun tetap aman.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Password Baru
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/90 px-5 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Konfirmasi Password Baru
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/90 px-5 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-500/90 px-4 py-3 text-sm font-medium text-white">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-50">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-emerald-500 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Simpan Password Baru"}
            </button>
          </form>

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
