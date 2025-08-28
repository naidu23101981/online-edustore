// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { hashSync } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Superadmins
  const superadmin1 = await prisma.user.upsert({
    where: { email: 'mu23101981@gmail.com' },
    update: {},
    create: {
      email: 'mu23101981@gmail.com',
      password: hashSync('superadmin123', 10),
      firstName: 'Naidu',
      lastName: 'super',
      role: 'SUPERADMIN',
      isEmailVerified: true,
    },
  });



  // 2. Admins
  const admin1 = await prisma.user.upsert({
    where: { email: 'vijaytn1984@gmail.com' },
    update: {},
    create: {
      email: 'vijaytn1984@gmail.com',
      password: hashSync('admin123', 10),
      firstName: 'Vijay',
      lastName: 'admin',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

    const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@gmail.com' },
    update: {},
    create: {
      email: 'admin2@gmail.com',
      password: hashSync('admin123', 10),
      firstName: 'Vijay',
      lastName: 'admin',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });



  // Admin permissions
  await prisma.adminPermission.createMany({
    data: [
      { adminId: admin1.id, canManageProducts: true, canManageCategories: true, canManageOrders: true },
      { adminId: admin2.id, canManageProducts: true },
    ],
  });

  // 3. Users
  const users = [];
  for (let i = 1; i <= 6; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: hashSync('user123', 10),
        firstName: `User${i}`,
        lastName: 'Test',
        role: 'USER',
        isEmailVerified: true,
      },
    });
    users.push(user);
  }

  // 4. Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Science', slug: 'science', description: 'PDFs on science topics' },
      { name: 'Math', slug: 'math', description: 'Math learning materials' },
      { name: 'English', slug: 'english', description: 'Grammar & comprehension' },
    ],
  });

  const createdCategories = await prisma.category.findMany();

  // 5. Products and ProductDetails
  const productList = [];
  for (let i = 1; i <= 5; i++) {
    const product = await prisma.product.create({
      data: {
        title: `Sample Book ${i}`,
        description: `This is a description of Book ${i}`,
        price: 49.99 + i,
        fileUrl: `uploads/book${i}.pdf`,
        fileName: `book${i}.pdf`,
        fileSize: 1024000 + i * 1000,
        categoryId: createdCategories[i % 3].id,
        isActive: true,
      },
    });

    await prisma.productDetails.create({
      data: {
        productId: product.id,
        language: 'English',
        pages: 100 + i * 10,
        format: 'PDF',
        version: `v${i}.0`,
        publisher: 'Edustore Publishing',
        publishedAt: new Date('2024-01-01'),
      },
    });

    productList.push(product);
  }

  // 6. Create 1 Order + DownloadId per user
  for (const user of users) {
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: productList[0].price,
        status: 'COMPLETED',
        paymentMethod: 'manual',
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: productList[0].id,
        quantity: 1,
        price: productList[0].price,
      },
    });

    await prisma.downloadId.create({
      data: {
        downloadId: `download-${user.id}`,
        userId: user.id,
        productId: productList[0].id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 7. Exams + Questions + Attempts
  for (let i = 0; i < 3; i++) {
    const exam = await prisma.exam.create({
      data: {
        title: `Test Exam ${i + 1}`,
        productId: productList[i].id,
        duration: 60,
        totalMarks: 30,
        passingMarks: 18,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    const q1 = await prisma.question.create({
      data: {
        examId: exam.id,
        type: 'MCQ',
        question: 'What is 2 + 2?',
        options: JSON.stringify(['2', '3', '4', '5']),
        correctAnswer: '4',
        marks: 10,
        order: 1,
      },
    });

    const q2 = await prisma.question.create({
      data: {
        examId: exam.id,
        type: 'TRUE_FALSE',
        question: 'Sun rises in the East.',
        correctAnswer: 'true',
        marks: 10,
        order: 2,
      },
    });

    const attempt = await prisma.examAttempt.create({
      data: {
        userId: users[i].id,
        examId: exam.id,
        totalMarks: 20,
        marksObtained: 15,
        percentage: 75,
        status: 'COMPLETED',
        timeSpent: 1800000,
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          attemptId: attempt.id,
          questionId: q1.id,
          userAnswer: '4',
          isCorrect: true,
          marksAwarded: 10,
        },
        {
          attemptId: attempt.id,
          questionId: q2.id,
          userAnswer: 'false',
          isCorrect: false,
          marksAwarded: 5,
        },
      ],
    });
  }

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
