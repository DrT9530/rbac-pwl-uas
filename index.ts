import { db } from "./src/infrastructure/database/prisma-client";

async function runTest() {
  try {
    const adminRole = await db.role.create({
      data: { name: "ADMIN", description: "Administrator Tertinggi" }
    });

    const createPerm = await db.permission.create({
      data: { name: "CREATE_ARTICLE", description: "Bisa buat artikel" }
    });

    const linkedRolePerm = await db.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: createPerm.id
      }
    });

    console.log("✅ Berhasil setup Database & RBAC!");
    console.log(linkedRolePerm);
  } catch (error) {
    console.error("❌ Gagal:", error);
  } finally {
    await db.$disconnect();
  }
}

runTest();