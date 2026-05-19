import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database...');

  // 1. Seed Role ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { 
      name: 'ADMIN', 
      description: 'Administrator tertinggi dengan akses penuh' 
    },
  });

  // 2. Seed Role EDITOR
  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: { 
      name: 'EDITOR', 
      description: 'Dapat membuat dan mengedit artikel' 
    },
  });

  // 3. Seed Role USER
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { 
      name: 'USER', 
      description: 'Pengguna biasa aplikasi' 
    },
  });

  console.log('✅ Seeding Role berhasil:');
  console.log({ adminRole, editorRole, userRole });
}

main()
  .catch((e) => {
    console.error('❌ Gagal seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });