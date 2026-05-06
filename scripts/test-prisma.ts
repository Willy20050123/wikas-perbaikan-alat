import { prisma } from "../src/lib/prisma";

async function main() {
  const totalUser = await prisma.user.count();
  console.log("Koneksi Prisma berhasil.");
  console.log("Jumlah user saat ini:", totalUser);
}

main()
  .catch((err) => {
    console.error("Tes Prisma gagal:");
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
