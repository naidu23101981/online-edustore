// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const AuthController = {
  async requestOtp(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
      await AuthService.sendOtpToEmail(email);
      return res.json({ message: 'OTP sent to email' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
  },

  async verifyOtp(req: Request, res: Response) {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    try {
      const { token, user } = await AuthService.verifyOtp(email, code);
      return res.json({ token, user });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },
};
