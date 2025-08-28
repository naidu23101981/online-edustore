const prisma = require('../prisma/client');

exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: { name, description },
    });

    res.status(201).json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
    });

    res.json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: Prevent deleting category if products exist
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products' });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
