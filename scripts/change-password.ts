import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const nip = "198501010000000001";
  const newPassword = "PasswordBaru123!";

  const user = await prisma.user.findUnique({
    where: { activeNip: nip },
  });

  if (!user) {
    console.log(`User dengan NIP ${nip} tidak ditemukan`);
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
    },
  });

  console.log("Password berhasil diubah");
  console.log("NIP:", nip);
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
