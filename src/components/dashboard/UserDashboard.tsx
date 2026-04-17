"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardList,
  Clock3,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = {
    nama: "Nama Pegawai",
    jabatan: "Pegawai",
    role: "USER",
  };

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/dashboard-user-bg.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-slate-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(to_bottom,rgba(2,6,23,0.14),rgba(2,6,23,0.28),rgba(2,6,23,0.42))]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-slate-950/10 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Sistem Laporan Barang & Alat
              </h1>
              <p className="mt-1 text-sm text-white/65">
                Portal internal pegawai
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_10px_25px_rgba(2,6,23,0.16)] backdrop-blur-md md:flex">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-base font-bold text-cyan-100 ring-1 ring-white/10">
                  NP
                </div>

                <div className="min-w-[170px]">
                  <p className="text-sm font-semibold text-white">{user.nama}</p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    <span>{user.jabatan}</span>
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {user.role}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logout..." : "Logout"}
                </button>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-bold text-cyan-100 shadow-[0_10px_25px_rgba(2,6,23,0.16)] backdrop-blur-md md:hidden">
                NP
              </div>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-7xl items-center gap-8 px-6 pb-4 md:flex">
            <button
              onClick={() => router.push("/dashboard/user")}
              className="font-medium text-white/90 transition hover:text-white"
            >
              Beranda
            </button>
            <button
              onClick={() => router.push("/dashboard/user/report")}
              className="font-medium text-white/70 transition hover:text-white"
            >
              Buat Laporan
            </button>
            <button
              onClick={() => router.push("/dashboard/user/status")}
              className="font-medium text-white/70 transition hover:text-white"
            >
              Status
            </button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 md:py-14">
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
              Dashboard Pegawai
            </p>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] md:text-6xl">
              Buat Laporan Kerusakan
              <span className="block text-cyan-100">dengan Mudah dan Cepat</span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-xl">
              Portal internal yang membantu pegawai membuat laporan kerusakan
              barang, alat, dan fasilitas kantor dengan tampilan sederhana namun
              tetap profesional.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/12 bg-white/10 p-6 shadow-[0_12px_35px_rgba(2,6,23,0.22)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-white/10">
                <ClipboardList className="h-8 w-8 text-cyan-100" />
              </div>

              <h3 className="text-2xl font-bold text-white">Buat Laporan</h3>

              <p className="mt-3 text-sm leading-7 text-white/72">
                Pilih kategori, isi detail kerusakan, lalu upload foto barang.
              </p>

              <button
                onClick={() => router.push("/dashboard/user/report")}
                className="mt-6 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Mulai
              </button>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/10 p-6 shadow-[0_12px_35px_rgba(2,6,23,0.22)] backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/12">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-white/10">
                <Clock3 className="h-8 w-8 text-emerald-100" />
              </div>

              <h3 className="text-2xl font-bold text-white">Cek Status</h3>

              <p className="mt-3 text-sm leading-7 text-white/72">
                Pantau perkembangan laporan yang sudah kamu kirim.
              </p>

              <button
                onClick={() => router.push("/dashboard/user/status")}
                className="mt-6 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Lihat
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}