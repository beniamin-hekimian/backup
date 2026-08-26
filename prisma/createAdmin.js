import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

async function main() { 
  const password = "Admin@1234";

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@foodapp.com",
    },
    update: {},
    create: {
      full_name: "System Admin",
      email: "admin@foodapp.com",
      password_hash: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created successfully:");
  console.log({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });