require("dotenv").config(); // ✅ Load environment variables first

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { generateOtp } = require('./utils/generateOtp'); // ✅ correct

const { sendOtpEmail } = require("./utils/mailer"); // ✅ correct

const { generateToken } = require("./utils/jwt");

const path = require("path");

const authMiddleware = require("./middleware/auth.middleware");

const { clearScreenDown } = require("readline");

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Import routes
const ordersRoutes = require('./routes/orders');

/**
 * @route POST /api/auth/request-otp
 * @desc  Generate and send OTP to email
 */
app.post("/api/auth/request-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  console.log(`📧 OTP requested for: ${email}`);

  // Delete any existing unused OTPs
  await prisma.otpCode.deleteMany({
    where: { email, used: false },
  });

  const code = generateOtp(); // e.g. 6-digit random
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

  await prisma.otpCode.create({
    data: { email, code, expiresAt },
  });

  try {
    // Check if email configuration is available
    if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      await sendOtpEmail(email, code);
      console.log(`✅ OTP ${code} sent to ${email} via email`);
    } else {
      // For development/testing, just log the OTP
      console.log(`🔧 DEVELOPMENT MODE: OTP ${code} for ${email} (email not configured)`);
    }
    
    res.json({ 
      message: "OTP sent successfully",
      code: process.env.NODE_ENV === 'development' ? code : undefined // Only show in development
    });
  } catch (err) {
    console.error('Email error:', err);
    // Still return success if OTP was created, just email failed
    res.json({ 
      message: "OTP created successfully (email failed)",
      code: process.env.NODE_ENV === 'development' ? code : undefined
    });
  }
});

/**
 * @route POST /api/auth/verify-otp
 * @desc  Verify OTP, generate token, and return user info
 */
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, code } = req.body;

  console.log(`🔍 Verifying OTP for: ${email}, code: ${code}`);

  const otpEntry = await prisma.otpCode.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpEntry) {
    console.log(`❌ Invalid OTP for ${email}`);
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }

  // Mark OTP as used
  await prisma.otpCode.update({
    where: { id: otpEntry.id },
    data: { used: true },
  });

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        firstName: "",
        lastName: "",
        role: "USER",
        isEmailVerified: true,
      },
    });
    console.log(`👤 New user created: ${email}`);
  } else {
    console.log(`👤 Existing user logged in: ${email}`);
  }

  // Generate JWT
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  console.log(`✅ Login successful for: ${email}`);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @route GET /
 * @desc  Health check
 */
app.get("/", (req, res) => {
  res.send("✅ Edustore API is running!");
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const { id } = req.user;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user });
});

// Use routes
app.use('/api/orders', ordersRoutes);

// ✅ Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email configured: ${process.env.SMTP_HOST ? 'Yes' : 'No'}`);
});


