import { prisma } from "../src/db.js";

async function main() {
  const roles = ["SUPER_ADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"];

  for (const name of roles) {
    await prisma.roles.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Seeded roles:", roles.join(", "));
}

main()
  .catch((e) => {
    console.error("❌ Seed roles failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
