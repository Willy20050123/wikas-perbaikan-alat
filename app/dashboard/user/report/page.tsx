"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Kategori =
  | "FASILITAS_INVENTARIS"
  | "IT_ELEKTRONIK"
  | "LABORATORIUM";

const kategoriLabels: Record<Kategori, string> = {
  FASILITAS_INVENTARIS: "Fasilitas & Inventaris",
  IT_ELEKTRONIK: "IT & Elektronik",
  LABORATORIUM: "Laboratorium",
};

export default function CreateReportPage() {
  const router = useRouter();

  const [kategori, setKategori] = useState<Kategori | "">("");
  const [namaBarang, setNamaBarang] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [severity, setSeverity] = useState<"RINGAN" | "SEDANG" | "BERAT">("SEDANG");
  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!kategori) {
      setMessage("Silakan pilih kategori terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("kategori", kategori);
      formData.append("namaBarang", namaBarang);
      formData.append("lokasi", lokasi);
      formData.append("deskripsi", deskripsi);
      formData.append("severity", severity);

      if (foto) {
        formData.append("foto", foto);
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal mengirim laporan.");
        setLoading(false);
        return;
      }

      setMessage("Laporan berhasil dikirim.");
      setNamaBarang("");
      setLokasi("");
      setDeskripsi("");
      setSeverity("SEDANG");
      setFoto(null);
      setPreviewUrl("");

      setTimeout(() => {
        router.push("/dashboard/user");
      }, 1200);
    } catch {
      setMessage("Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">Buat Laporan</h1>
          <p className="mt-2 text-white/70">
            Pilih kategori, isi detail kerusakan, lalu upload foto barang atau alat.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="mb-4 text-xl font-semibold">Pilih Kategori</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(
              [
                "FASILITAS_INVENTARIS",
                "IT_ELEKTRONIK",
                "LABORATORIUM",
              ] as Kategori[]
            ).map((item) => {
              const active = kategori === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setKategori(item)}
                  className={[
                    "rounded-2xl border p-5 text-left transition",
                    active
                      ? "border-cyan-300 bg-cyan-400/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <p className="text-lg font-bold">{kategoriLabels[item]}</p>
                  <p className="mt-2 text-sm text-white/70">
                    Pilih kategori ini untuk membuat laporan.
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {kategori ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
          >
            <h2 className="text-2xl font-bold">
              Form Laporan - {kategoriLabels[kategori]}
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Kategori</label>
                <input
                  value={kategoriLabels[kategori]}
                  disabled
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nama Barang / Alat
                </label>
                <input
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  placeholder="Contoh: AC Ruang Rapat"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Lokasi</label>
                <input
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Ruang TU"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tingkat Kerusakan
                </label>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as "RINGAN" | "SEDANG" | "BERAT")
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
                >
                  <option value="RINGAN" className="text-black">Ringan</option>
                  <option value="SEDANG" className="text-black">Sedang</option>
                  <option value="BERAT" className="text-black">Berat</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Upload Foto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFoto(file);

                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    } else {
                      setPreviewUrl("");
                    }
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-white"
                />
              </div>

              {previewUrl ? (
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-medium">Preview Foto</p>
                  <img
                    src={previewUrl}
                    alt="Preview upload"
                    className="max-h-72 rounded-2xl border border-white/10 object-cover"
                  />
                </div>
              ) : null}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Deskripsi Kerusakan
                </label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={5}
                  placeholder="Jelaskan kerusakan barang atau alat..."
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            {message ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                {message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/user")}
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                Kembali
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}