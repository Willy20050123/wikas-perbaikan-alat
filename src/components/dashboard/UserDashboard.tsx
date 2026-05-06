import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, CircleUserRound, ShieldCheck } from "lucide-react";
import UserDashboardLogoutButton from "./UserDashboardLogoutButton";

type UserDashboardProps = {
  currentUser: {
    id: number;
    nama: string;
    jabatan: string | null;
    nip: string | null;
    role: "USER";
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserDashboard({ currentUser }: UserDashboardProps) {
  const initials = getInitials(currentUser.nama) || "U";

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Image
        src="/images/dashboard-user-bg.jpg"
        alt=""
        fill
        preload={true}
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-slate-950/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(to_bottom,rgba(2,6,23,0.12),rgba(2,6,23,0.24),rgba(2,6,23,0.4))]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-slate-950/10">
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
              <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-[0_10px_25px_rgba(2,6,23,0.16)] md:flex">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-base font-bold text-cyan-100 ring-1 ring-white/10">
                  {initials}
                </div>

                <div className="min-w-[170px]">
                  <p className="text-sm font-semibold text-white">
                    {currentUser.nama}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    <span>{currentUser.jabatan || "Pegawai Internal"}</span>
                  </div>

                  <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {currentUser.role}
                  </div>

                  <div className="mt-2 text-[11px] text-white/55">
                    NIP: {currentUser.nip || "-"}
                  </div>
                </div>

                <Link
                  href="/dashboard/account"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <CircleUserRound className="h-4 w-4" />
                  Akun
                </Link>

                <UserDashboardLogoutButton className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60" />
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-bold text-cyan-100 shadow-[0_10px_25px_rgba(2,6,23,0.16)] md:hidden">
                {initials}
              </div>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-7xl items-center gap-8 px-6 pb-4 md:flex">
            <Link
              href="/dashboard/user"
              className="font-medium text-white/90 transition hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/user/report"
              className="font-medium text-white/70 transition hover:text-white"
            >
              Buat Laporan
            </Link>
            <Link
              href="/dashboard/user/status"
              className="font-medium text-white/70 transition hover:text-white"
            >
              Status
            </Link>
            <Link
              href="/dashboard/account"
              className="font-medium text-white/70 transition hover:text-white"
            >
              Akun
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-3 px-6 pb-4 md:hidden">
            <Link
              href="/dashboard/user/report"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Buat Laporan
            </Link>
            <Link
              href="/dashboard/user/status"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Status
            </Link>
            <Link
              href="/dashboard/account"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Akun
            </Link>
            <UserDashboardLogoutButton className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60" />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 md:py-14">
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
              Dashboard Pegawai
            </p>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] md:text-6xl">
              Buat Laporan Kerusakan
              <span className="block text-cyan-100">
                dengan Mudah dan Cepat
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-xl">
              Portal internal yang membantu pegawai membuat laporan kerusakan
              barang, alat, dan fasilitas kantor dengan tampilan sederhana namun
              tetap profesional.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
