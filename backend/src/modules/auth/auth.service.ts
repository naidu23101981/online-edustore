// src/modules/auth/auth.service.ts
import { PrismaClient, Role } from '@prisma/client';
import { generateOTP } from './utils/otp';
import { generateAccessToken } from './utils/jwt';

const prisma = new PrismaClient();

export const AuthService = {
  async sendOtpToEmail(email: string) {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    // TODO: Replace with actual email sending (e.g. nodemailer)
    console.log(`[DEBUG] OTP for ${email}: ${otp}`);
  },

  async verifyOtp(email: string, code: string) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: 'otp-login', // unused
          firstName: 'User',
          lastName: '',
          role: Role.USER,
        },
      });
    }

    const token = generateAccessToken({ id: user.id, email: user.email, role: user.role });

    return { token, user };
  },
};
