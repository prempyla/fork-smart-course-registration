import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = ["Student", "Faculty", "Admin"];

  // Create roles
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Default roles seeded successfully!");

  // Create test users for each role
  const testUsers = [
    {
      email: "student@test.com",
      password: "student123",
      full_name: "Test Student",
      role: "Student",
    },
    {
      email: "faculty@test.com",
      password: "faculty123",
      full_name: "Test Faculty",
      role: "Faculty",
    },
    {
      email: "admin@test.com",
      password: "admin123",
      full_name: "Test Admin",
      role: "Admin",
    },
  ];

  for (const user of testUsers) {
    const role = await prisma.role.findUnique({
      where: { name: user.role },
    });

    if (!role) {
      console.error(`❌ Role ${user.role} not found`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        full_name: user.full_name,
      },
      create: {
        email: user.email,
        password: hashedPassword,
        full_name: user.full_name,
        role: {
          connect: { id: role.id }
        }
      },
    });

    console.log(`✅ Test user created: ${user.email} (${user.role})`);
  }

  console.log("✅ All test users seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
