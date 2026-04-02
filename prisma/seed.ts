import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin12345", 12);

  await prisma.user.upsert({
    where: { email: "admin@hanoi.local" },
    update: {
      name: "Адміністратор",
      passwordHash,
      role: "admin",
    },
    create: {
      email: "admin@hanoi.local",
      name: "Адміністратор",
      passwordHash,
      role: "admin",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
