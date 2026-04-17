import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const defaultPassword = "Admin123!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const users = [
    {
      nama: "Admin Utama",
      email: "admin1@websitekantor.local",
      role: "ADMIN",
    },
    {
      nama: "Admin Operasional",
      email: "admin2@websitekantor.local",
      role: "ADMIN",
    },
    {
      nama: "Admin Monitoring",
      email: "admin3@websitekantor.local",
      role: "ADMIN",
    },
    {
      nama: "Admin Super",
      email: "admin4@websitekantor.local",
      role: "ADMIN",
    },
    {
      nama: "User Biasa",
      email: "user1@websitekantor.local",
      role: "USER",
    },
  ] as const;

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        nama: user.nama,
        role: user.role,
        passwordHash,
      },
      create: {
        nama: user.nama,
        email: user.email,
        role: user.role,
        passwordHash,
      },
    });
  }

  console.log("Seed berhasil dijalankan.");
  console.log("Akun yang tersedia:");
  console.log("- admin1@websitekantor.local / Admin123!");
  console.log("- admin2@websitekantor.local / Admin123!");
  console.log("- admin3@websitekantor.local / Admin123!");
  console.log("- admin4@websitekantor.local / Admin123!");
  console.log("- user1@websitekantor.local / Admin123!");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });