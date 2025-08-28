const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');

// Only allow authenticated admins
router.use(auth, isAdmin);

// 📊 GET /api/admin/analytics/top-performers
router.get('/top-performers', async (req, res) => {
  try {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        status: 'COMPLETED',
      },
      orderBy: {
        percentage: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        exam: {
          select: {
            title: true,
          },
        },
      },
      take: 50, // top 50 results
    });

    const result = attempts.map((a) => ({
      name: `${a.user.firstName} ${a.user.lastName}`,
      email: a.user.email,
      exam: a.exam.title,
      score: `${a.marksObtained}/${a.totalMarks}`,
      percentage: a.percentage,
      status: a.status,
    }));

    res.json({ topPerformers: result });
  } catch (err) {
    console.error('Error fetching top performers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
