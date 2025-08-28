const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdminPermission } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const pdfDir = path.join(uploadDir, 'pdfs');
const thumbnailDir = path.join(uploadDir, 'thumbnails');

[uploadDir, pdfDir, thumbnailDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const pdfUpload = multer({
  storage: pdfStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50000000 // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Multer configuration for thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbnailDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: 5000000 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload PDF
router.post('/pdf', authenticateToken, requireAdminPermission('canManageProducts'), pdfUpload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const fileUrl = `/uploads/pdfs/${req.file.filename}`;
    
    res.json({
      message: 'PDF uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload thumbnail
router.post('/thumbnail', authenticateToken, requireAdminPermission('canManageProducts'), thumbnailUpload.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No thumbnail file uploaded' });
    }

    const fileUrl = `/uploads/thumbnails/${req.file.filename}`;
    
    res.json({
      message: 'Thumbnail uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete file
router.delete('/file/:filename', authenticateToken, requireAdminPermission('canManageProducts'), async (req, res) => {
  try {
    const { filename } = req.params;
    const { type } = req.query; // 'pdf' or 'thumbnail'

    const dir = type === 'pdf' ? pdfDir : thumbnailDir;
    const filePath = path.join(dir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upload statistics
router.get('/stats', authenticateToken, requireAdminPermission('canManageProducts'), async (req, res) => {
  try {
    const pdfFiles = fs.readdirSync(pdfDir);
    const thumbnailFiles = fs.readdirSync(thumbnailDir);

    const pdfStats = pdfFiles.map(file => {
      const filePath = path.join(pdfDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    const thumbnailStats = thumbnailFiles.map(file => {
      const filePath = path.join(thumbnailDir, file);
      const stats = fs.statSync(filePath);
      return {
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });

    const totalPdfSize = pdfStats.reduce((sum, file) => sum + file.size, 0);
    const totalThumbnailSize = thumbnailStats.reduce((sum, file) => sum + file.size, 0);

    res.json({
      pdfs: {
        count: pdfFiles.length,
        totalSize: totalPdfSize,
        files: pdfStats
      },
      thumbnails: {
        count: thumbnailFiles.length,
        totalSize: totalThumbnailSize,
        files: thumbnailStats
      },
      totalSize: totalPdfSize + totalThumbnailSize
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;