import path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), "..", ".env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tableCounts = {
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    adminUsers: await prisma.adminUser.count(),
  };
  console.log("✅ Connected. Counts:", tableCounts);
}

main()
  .catch((e) => {
    console.error("❌ DB test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
