const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');

// GET product details by productId
router.get('/:productId', auth, isAdmin, async (req, res) => {
  const { productId } = req.params;
  try {
    const details = await prisma.productDetails.findUnique({
      where: { productId },
    });
    if (!details) return res.status(404).json({ message: 'Details not found' });
    res.json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// POST or UPDATE product details
router.post('/:productId', auth, isAdmin, async (req, res) => {
  const { productId } = req.params;
  const data = req.body;

  try {
    const existing = await prisma.productDetails.findUnique({ where: { productId } });
    let result;

    if (existing) {
      result = await prisma.productDetails.update({
        where: { productId },
        data,
      });
    } else {
      result = await prisma.productDetails.create({
        data: {
          ...data,
          productId,
        },
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save product details' });
  }
});

module.exports = router;
