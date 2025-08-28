const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Superadmin: Create admin user
router.post('/create-admin', authenticateToken, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    const { email, password, firstName, lastName, permissions } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN',
        isEmailVerified: true
      }
    });

    // Create admin permissions
    await prisma.adminPermission.create({
      data: {
        adminId: adminUser.id,
        canManageProducts: permissions?.canManageProducts || false,
        canManageCategories: permissions?.canManageCategories || false,
        canManageOrders: permissions?.canManageOrders || false,
        canManageExams: permissions?.canManageExams || false,
        canViewAnalytics: permissions?.canViewAnalytics || false
      }
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Superadmin: Get all admins
router.get('/admins', authenticateToken, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        isEmailVerified: true
      }
    });

    // Get permissions for each admin
    const adminsWithPermissions = await Promise.all(
      admins.map(async (admin) => {
        const permissions = await prisma.adminPermission.findUnique({
          where: { adminId: admin.id }
        });
        
        return {
          ...admin,
          permissions: permissions || {
            canManageProducts: false,
            canManageCategories: false,
            canManageOrders: false,
            canManageExams: false,
            canViewAnalytics: false
          }
        };
      })
    );

    res.json(adminsWithPermissions);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Superadmin: Update admin permissions
router.put('/admins/:adminId/permissions', authenticateToken, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    const { adminId } = req.params;
    const permissions = req.body;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: 'ADMIN' }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const updatedPermissions = await prisma.adminPermission.upsert({
      where: { adminId },
      update: permissions,
      create: {
        adminId,
        ...permissions
      }
    });

    res.json(updatedPermissions);
  } catch (error) {
    console.error('Update admin permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Superadmin: Delete admin
router.delete('/admins/:adminId', authenticateToken, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    const { adminId } = req.params;

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: 'ADMIN' }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Delete admin permissions and user
    await Promise.all([
      prisma.adminPermission.deleteMany({
        where: { adminId }
      }),
      prisma.user.delete({
        where: { id: adminId }
      })
    ]);

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Superadmin: Analytics dashboard
router.get('/analytics', authenticateToken, requireRole(['SUPERADMIN']), async (req, res) => {
  try {
    // User statistics
    const totalUsers = await prisma.user.count({
      where: { role: 'USER' }
    });

    const newUsersThisMonth = await prisma.user.count({
      where: {
        role: 'USER',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    // Sales statistics
    const salesStats = await prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
      _count: true,
      _avg: { totalAmount: true }
    });

    // Top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { status: 'COMPLETED' }
      },
      _sum: { quantity: true },
      _count: true,
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 10
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { title: true, price: true, thumbnail: true }
        });
        
        return {
          ...product,
          totalSold: item._sum.quantity,
          revenue: product.price * item._sum.quantity
        };
      })
    );

    // Exam statistics
    const examStats = await prisma.examAttempt.aggregate({
      where: { status: 'COMPLETED' },
      _avg: { percentage: true },
      _count: true
    });

    // Monthly signups
    const monthlySignups = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as signups
      FROM "users" 
      WHERE role = 'USER'
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 12
    `;

    // Leaderboard - top performers
    const leaderboard = await prisma.examAttempt.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        exam: {
          select: { title: true }
        }
      },
      orderBy: { percentage: 'desc' },
      take: 20
    });

    res.json({
      userStats: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        monthlySignups
      },
      salesStats: {
        totalRevenue: salesStats._sum.totalAmount || 0,
        totalOrders: salesStats._count,
        avgOrderValue: salesStats._avg.totalAmount || 0,
        topProducts: topProductsWithDetails
      },
      examStats: {
        totalAttempts: examStats._count,
        avgScore: examStats._avg.percentage || 0,
        leaderboard
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin permissions
router.get('/permissions', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const permissions = await prisma.adminPermission.findUnique({
      where: { adminId: req.user.id }
    });

    res.json(permissions || {
      canManageProducts: false,
      canManageCategories: false,
      canManageOrders: false,
      canManageExams: false,
      canViewAnalytics: false
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;