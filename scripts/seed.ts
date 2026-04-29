import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const defaultPassword = "Admin123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const users = [
    {
      nama: "Admin Utama",
      jabatan: "Kepala Administrasi",
      nip: "198501010000000001",
      role: "ADMIN",
    },
    {
      nama: "Admin Operasional",
      jabatan: "Koordinator Operasional",
      nip: "198501010000000002",
      role: "ADMIN",
    },
    {
      nama: "Admin Monitoring",
      jabatan: "Analis Monitoring",
      nip: "198501010000000003",
      role: "ADMIN",
    },
    {
      nama: "Admin Super",
      jabatan: "Administrator Sistem",
      nip: "198501010000000004",
      role: "ADMIN",
    },
    {
      nama: "User Biasa",
      jabatan: "Staff Umum",
      nip: "198501010000000005",
      role: "USER",
    },
  ] as const;

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        nip: user.nip,
      },
      update: {
        nama: user.nama,
        jabatan: user.jabatan,
        nip: user.nip,
        role: user.role,
        passwordHash,
      },
      create: {
        nama: user.nama,
        jabatan: user.jabatan,
        nip: user.nip,
        role: user.role,
        passwordHash,
      },
    });
  }

  console.log("Seed berhasil dijalankan.");
  console.log("Akun yang tersedia:");
  console.log("- 198501010000000001 / Admin123!");
  console.log("- 198501010000000002 / Admin123!");
  console.log("- 198501010000000003 / Admin123!");
  console.log("- 198501010000000004 / Admin123!");
  console.log("- 198501010000000005 / Admin123!");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
