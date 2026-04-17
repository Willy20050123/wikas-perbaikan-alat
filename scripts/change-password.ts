import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "admin1@websitekantor.local";
  const newPassword = "PasswordBaru123!";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`User dengan email ${email} tidak ditemukan`);
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
    },
  });

  console.log("Password berhasil diubah");
  console.log("Email:", email);
  console.log("Password baru:", newPassword);
}

main()
  .catch((error) => {
    console.error("Gagal mengubah password:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });