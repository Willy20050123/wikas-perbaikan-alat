"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";

type AccountUser = {
  id: number;
  nama: string;
  jabatan: string | null;
  nip: string | null;
  role: "ADMIN" | "USER";
};

type AccountSettingsPageProps = {
  currentUser: AccountUser;
};

export default function AccountSettingsPage({
  currentUser,
}: AccountSettingsPageProps) {
  const router = useRouter();
  const canEditProfile = currentUser.role === "ADMIN";

  const [nama, setNama] = useState(currentUser.nama);
  const [jabatan, setJabatan] = useState(currentUser.jabatan || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEditProfile) {
      setMessage("Nama dan jabatan hanya dapat diubah oleh admin.");
      return;
    }

    setProfileLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          jabatan,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Profil berhasil diperbarui.");

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      setPasswordMessage(data.message || "Password berhasil diperbarui.");

      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error(error);
      setPasswordMessage("Terjadi kesalahan saat memperbarui password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
              Pengaturan Akun
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">Profil & Keamanan</h1>
            <p className="mt-3 max-w-2xl text-white/70">
              {canEditProfile
                ? "Perbarui identitas yang tampil di dashboard dan ubah password akunmu."
                : "Lihat identitas akunmu dan ubah password. Nama dan jabatan dikelola oleh admin."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                currentUser.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user"
              )
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.16)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10">
                <UserRound className="h-6 w-6 text-cyan-100" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Profil</h2>
                <p className="text-sm text-white/60">
                  Data ini digunakan untuk identitas di dalam sistem.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">NIP Login</p>
              <p className="mt-1 font-semibold text-white">
                {currentUser.nip || "-"}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                <ShieldCheck className="h-4 w-4" />
                {currentUser.role}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Nama
                </label>
                <input
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  required
                  disabled={!canEditProfile}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Jabatan
                </label>
                <input
                  value={jabatan}
                  onChange={(event) => setJabatan(event.target.value)}
                  placeholder="Contoh: Staff Operasional"
                  disabled={!canEditProfile}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {!canEditProfile ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  Nama dan jabatan hanya dapat diperbarui oleh admin.
                </div>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                  {message}
                </div>
              ) : null}

              {canEditProfile ? (
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {profileLoading ? "Menyimpan..." : "Simpan Profil"}
                </button>
              ) : null}
            </form>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_60px_rgba(2,6,23,0.16)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-400/10">
                <KeyRound className="h-6 w-6 text-emerald-100" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Keamanan</h2>
                <p className="text-sm text-white/60">
                  Gunakan password baru yang kuat dan mudah diingat.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-emerald-300/30"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Password minimal 8 karakter dan harus mengandung huruf, angka, dan simbol.
              </div>

              {passwordMessage ? (
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                  {passwordMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <KeyRound className="h-4 w-4" />
                {passwordLoading ? "Memperbarui..." : "Ubah Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
