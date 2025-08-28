const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, subtotal, tax, total } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!subtotal || !tax || !total) {
      return res.status(400).json({ error: 'Pricing information is required' });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.id,
            title: item.title,
            category: item.category,
            price: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Generate download IDs for each item
    const downloadIds = [];
    for (let i = 0; i < items.length; i++) {
      const downloadId = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      downloadIds.push(downloadId);
      
      // Create download record
      await prisma.download.create({
        data: {
          downloadId,
          orderId: order.id,
          productId: items[i].id,
          userId,
          status: 'ACTIVE'
        }
      });
    }

    // Update order with download IDs
    await prisma.order.update({
      where: { id: order.id },
      data: { downloadIds }
    });

    console.log(`✅ Order created: ${orderNumber} for user ${userId}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        downloadIds
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's order history
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        downloads: true
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.order.count({
      where: { userId }
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order details
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: true,
        downloads: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin only)
router.patch('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      include: {
        items: true,
        downloads: true
      }
    });

    console.log(`✅ Order ${orderId} status updated to ${status}`);

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Download a product (requires valid download ID)
router.post('/download/:downloadId', authMiddleware, async (req, res) => {
  try {
    const { downloadId } = req.params;
    const userId = req.user.id;

    const download = await prisma.download.findFirst({
      where: {
        downloadId,
        userId,
        status: 'ACTIVE'
      },
      include: {
        order: true,
        product: true
      }
    });

    if (!download) {
      return res.status(404).json({ error: 'Download not found or expired' });
    }

    // Check if order is completed
    if (download.order.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Order must be completed to download' });
    }

    // TODO: Implement actual file download logic
    // For now, just return success
    console.log(`✅ Download requested: ${downloadId} for user ${userId}`);

    res.json({
      message: 'Download started',
      download: {
        id: download.downloadId,
        productTitle: download.product?.title || 'Unknown Product',
        orderNumber: download.order.orderNumber
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todayOrders,
      todayRevenue
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { total: true }
      })
    ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
