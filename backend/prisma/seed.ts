import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // --- Global Roles ---
  const roles = ["super_admin", "campus_admin", "it_support"];
  for (const roleName of roles) {
    await prisma.globalRole.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log("✅ Global roles created");

  const superAdminRole = await prisma.globalRole.findUnique({ where: { name: "super_admin" } });
  const campusAdminRole = await prisma.globalRole.findUnique({ where: { name: "campus_admin" } });
  const itSupportRole = await prisma.globalRole.findUnique({ where: { name: "it_support" } });

  if (!superAdminRole || !campusAdminRole || !itSupportRole) {
    throw new Error("Roles not found after seeding");
  }

  const adminPassword = await bcrypt.hash("adminedlink123", 10);
  const userPassword = await bcrypt.hash("password123", 10);

  // --- Admin Users ---
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@edlink.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@edlink.com",
      password: adminPassword,
    },
  });

  const campusAdmin = await prisma.user.upsert({
    where: { email: "campus@edlink.com" },
    update: {},
    create: {
      name: "Campus Admin",
      email: "campus@edlink.com",
      password: adminPassword,
    },
  });

  const itSupport = await prisma.user.upsert({
    where: { email: "it@edlink.com" },
    update: {},
    create: {
      name: "IT Support",
      email: "it@edlink.com",
      password: adminPassword,
    },
  });

  // Assign global roles
  await prisma.userGlobalRole.upsert({
    where: { userId_globalRoleId: { userId: superAdmin.id, globalRoleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, globalRoleId: superAdminRole.id },
  });
  await prisma.userGlobalRole.upsert({
    where: { userId_globalRoleId: { userId: campusAdmin.id, globalRoleId: campusAdminRole.id } },
    update: {},
    create: { userId: campusAdmin.id, globalRoleId: campusAdminRole.id },
  });
  await prisma.userGlobalRole.upsert({
    where: { userId_globalRoleId: { userId: itSupport.id, globalRoleId: itSupportRole.id } },
    update: {},
    create: { userId: itSupport.id, globalRoleId: itSupportRole.id },
  });
  console.log("✅ Admin users created");

  // --- Dosen Users ---
  const drAhmad = await prisma.user.upsert({
    where: { email: "ahmad@edlink.com" },
    update: {},
    create: {
      name: "Dr. Ahmad",
      email: "ahmad@edlink.com",
      password: userPassword,
    },
  });

  const drBudi = await prisma.user.upsert({
    where: { email: "budi@edlink.com" },
    update: {},
    create: {
      name: "Dr. Budi",
      email: "budi@edlink.com",
      password: userPassword,
    },
  });
  console.log("✅ Dosen users created");

  // --- Mahasiswa Users ---
  const siti = await prisma.user.upsert({
    where: { email: "siti@edlink.com" },
    update: {},
    create: {
      name: "Siti",
      email: "siti@edlink.com",
      password: userPassword,
    },
  });

  const andi = await prisma.user.upsert({
    where: { email: "andi@edlink.com" },
    update: {},
    create: {
      name: "Andi",
      email: "andi@edlink.com",
      password: userPassword,
    },
  });

  const rina = await prisma.user.upsert({
    where: { email: "rina@edlink.com" },
    update: {},
    create: {
      name: "Rina",
      email: "rina@edlink.com",
      password: userPassword,
    },
  });
  console.log("✅ Mahasiswa users created");

  // --- Asdos User ---
  const dimas = await prisma.user.upsert({
    where: { email: "dimas@edlink.com" },
    update: {},
    create: {
      name: "Dimas",
      email: "dimas@edlink.com",
      password: userPassword,
    },
  });
  console.log("✅ Asdos user created");

  // --- Courses ---
  const course1 = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Pemrograman Web Lanjut",
      description: "Mempelajari konsep lanjutan dalam pengembangan aplikasi web modern menggunakan framework terkini.",
      createdBy: drAhmad.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Basis Data",
      description: "Mempelajari konsep basis data relasional, normalisasi, SQL, dan implementasi menggunakan MySQL.",
      createdBy: drBudi.id,
    },
  });
  console.log("✅ Courses created");

  // --- Course Members ---
  const membersData = [
    { userId: drAhmad.id, courseId: course1.id, role: "dosen" },
    { userId: siti.id, courseId: course1.id, role: "mahasiswa" },
    { userId: andi.id, courseId: course1.id, role: "mahasiswa" },
    { userId: rina.id, courseId: course1.id, role: "mahasiswa" },
    { userId: dimas.id, courseId: course1.id, role: "asdos" },
    { userId: drBudi.id, courseId: course2.id, role: "dosen" },
    { userId: siti.id, courseId: course2.id, role: "mahasiswa" },
    { userId: andi.id, courseId: course2.id, role: "mahasiswa" },
  ];

  for (const member of membersData) {
    await prisma.courseMember.upsert({
      where: {
        userId_courseId: { userId: member.userId, courseId: member.courseId },
      },
      update: {},
      create: member,
    });
  }
  console.log("✅ Course members assigned");

  // --- Assignments ---
  const assignment1 = await prisma.assignment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      courseId: course1.id,
      title: "Tugas 1 - REST API",
      description: "Buatlah REST API sederhana menggunakan Elysia framework dengan fitur CRUD untuk entitas mahasiswa.",
      dueDate: new Date("2026-06-15T23:59:59Z"),
      createdBy: drAhmad.id,
    },
  });

  const assignment2 = await prisma.assignment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      courseId: course2.id,
      title: "Tugas 1 - Normalisasi Database",
      description: "Lakukan normalisasi hingga bentuk 3NF pada studi kasus sistem informasi perpustakaan.",
      dueDate: new Date("2026-06-20T23:59:59Z"),
      createdBy: drBudi.id,
    },
  });
  console.log("✅ Assignments created");

  // --- Submission ---
  await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment1.id,
        studentId: siti.id,
      },
    },
    update: {},
    create: {
      assignmentId: assignment1.id,
      studentId: siti.id,
      content: "Berikut adalah implementasi REST API menggunakan Elysia framework...",
      fileUrl: null,
      grade: 85,
      feedback: "Bagus! Namun perlu ditambahkan validasi input.",
    },
  });
  console.log("✅ Sample submission created");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
