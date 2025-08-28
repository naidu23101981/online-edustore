const prisma = require('../../prisma/client');

exports.createProduct = async (req, res) => {
  try {
    const { title, price, categoryId } = req.body;
    const file = req.files?.file?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!file) return res.status(400).json({ error: 'PDF file is required.' });

    const product = await prisma.product.create({
      data: {
        title,
        price: parseFloat(price),
        categoryId,
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        thumbnail: thumbnail ? `/uploads/${thumbnail.filename}` : null,
      },
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, price, categoryId } = req.body;
    const { id } = req.params;

    const file = req.files?.file?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    const updatedData = {
      title,
      price: parseFloat(price),
      categoryId,
    };

    if (file) {
      updatedData.fileUrl = `/uploads/${file.filename}`;
      updatedData.fileName = file.originalname;
      updatedData.fileSize = file.size;
    }

    if (thumbnail) {
      updatedData.thumbnail = `/uploads/${thumbnail.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updatedData,
    });

    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating product' });
  }
};
