const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');

router.use(auth, isAdmin);

// ✅ Get all exams
router.get('/', async (req, res) => {
  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ exams });
});

// ✅ Get a single exam with questions
router.get('/:id', async (req, res) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
    },
  });

  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json({ exam });
});

// ✅ Create new exam
router.post('/', async (req, res) => {
  const { title, description, duration, passingMarks, productId, questions } = req.body;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const exam = await prisma.exam.create({
    data: {
      title,
      description,
      duration,
      passingMarks,
      totalMarks,
      status: 'DRAFT',
      productId: productId || null,
      questions: {
        create: questions.map((q, i) => ({
          question: q.question,
          type: q.type,
          options: q.options || undefined,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          order: i + 1,
        })),
      },
    },
  });

  res.status(201).json({ exam });
});

// ✅ Update exam and replace all questions
router.put('/:id', async (req, res) => {
  const { title, description, duration, passingMarks, productId, questions } = req.body;
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const examId = req.params.id;

  // Update exam fields
  await prisma.exam.update({
    where: { id: examId },
    data: {
      title,
      description,
      duration,
      passingMarks,
      totalMarks,
      productId: productId || null,
    },
  });

  // Delete existing questions
  await prisma.question.deleteMany({ where: { examId } });

  // Insert new questions
  await prisma.question.createMany({
    data: questions.map((q, i) => ({
      examId,
      question: q.question,
      type: q.type,
      options: q.options || undefined,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      order: i + 1,
    })),
  });

  res.json({ message: 'Exam updated successfully' });
});

// ✅ Update exam status (publish/draft)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const exam = await prisma.exam.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ message: `Status updated to ${status}` });
});

// ✅ Delete exam
router.delete('/:id', async (req, res) => {
  await prisma.exam.delete({ where: { id: req.params.id } });
  res.json({ message: 'Exam deleted' });
});

module.exports = router;
