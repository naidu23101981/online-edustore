// prisma/clear-db.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');

    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "answers",
        "exam_attempts",
        "questions",
        "exams",
        "order_items",
        "orders",
        "download_ids",
        "product_details",
        "products",
        "categories",
        "otp_codes",
        "leaderboard_entries",
        "notifications",
        "admin_permissions",
        "payment_events",
        "users"
      RESTART IDENTITY CASCADE;
    `);

    console.log('✅ Database cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
