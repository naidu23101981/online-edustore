const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { sendOtpEmail } = require('../utils/mailer');
const { sendOtpSms, sendOtpSmsFallback } = require('../utils/sms');
const { generateOtp } = require('../utils/generateotp');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone format
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// Helper function to normalize phone number
function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

// 🔐 POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
  const { email, phone } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    // Check for existing unused OTP within last 1 minute
    const existingOtp = await prisma.otpCode.findFirst({
      where: {
        OR: [
          { email: email || null },
          { phone: phone || null }
        ],
        used: false,
        expiresAt: { gt: new Date() },
        createdAt: { gt: new Date(Date.now() - 60 * 1000) } // Last 1 minute
      }
    });

    if (existingOtp) {
      return res.status(429).json({ 
        error: 'Please wait 1 minute before requesting another OTP',
        retryAfter: 60
      });
    }

    // Create OTP record
    const otpData = {
      code,
      expiresAt,
      used: false
    };

    if (email) {
      otpData.email = email;
    }
    if (phone) {
      otpData.phone = normalizePhone(phone);
    }

    await prisma.otpCode.create({
      data: otpData
    });

    // Send OTP via appropriate channel
    if (email) {
      await sendOtpEmail(email, code);
      console.log(`Email OTP sent to ${email}: ${code}`);
    } else if (phone) {
      try {
        await sendOtpSms(phone, code);
      } catch (smsError) {
        console.log('Primary SMS failed, trying fallback...');
        await sendOtpSmsFallback(phone, code);
      }
      console.log(`SMS OTP sent to ${phone}: ${code}`);
    }

    res.json({ 
      message: `OTP sent successfully to ${email || phone}`,
      method: email ? 'email' : 'sms'
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// 🔐 POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, phone, code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'OTP code is required' });
  }

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  try {
    const otpWhere = {
      code,
      used: false,
      expiresAt: { gte: new Date() }
    };

    if (email) {
      otpWhere.email = email;
    } else if (phone) {
      otpWhere.phone = normalizePhone(phone);
    }

    const otp = await prisma.otpCode.findFirst({
      where: otpWhere
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true }
    });

    // Find or create user
    const userWhere = email ? { email } : { phone: normalizePhone(phone) };
    let user = await prisma.user.findFirst({ where: userWhere });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || null,
          phone: phone ? normalizePhone(phone) : null,
          firstName: '',
          lastName: '',
          role: 'USER',
          isEmailVerified: email ? true : false,
          isPhoneVerified: phone ? true : false
        }
      });
    } else {
      // Update verification status
      const updateData = {};
      if (email) updateData.isEmailVerified = true;
      if (phone) updateData.isPhoneVerified = true;
      
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email,
        phone: user.phone
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (err) {
    console.error('OTP verification failed:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// 🔐 POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newToken = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email,
        phone: user.phone
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// 🔐 GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
