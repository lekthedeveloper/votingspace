import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../models/prisma.client';
import { AppError } from '../../utils/appError';
import config from '../../config/config';
import { ERROR_MESSAGES } from '../../config/constants';
import logger from '../../utils/logger';
import { sendEmail } from '../../utils/email';

class AuthService {
  static async register(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new AppError(400, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: 'USER'
      }
    });

    // Generate tokens
    const accessToken = this.generateToken(user.id, 'access');
    const refreshToken = this.generateToken(user.id, 'refresh');

    // Remove password from output
    delete (user as any).password;

    return { user, accessToken, refreshToken };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = this.generateToken(user.id, 'access');
    const refreshToken = this.generateToken(user.id, 'refresh');

    delete (user as any).password;

    return { user, accessToken, refreshToken };
  }

  private static generateToken(userId: string, type: 'access' | 'refresh') {
    const secret = config.jwt.secret;
    const expiresIn = type === 'access' 
      ? config.jwt.accessExpiresIn 
      : config.jwt.refreshExpiresIn;

    return jwt.sign({ id: userId }, secret, { expiresIn });
  }

  static async refreshAccessToken(refreshToken: string) {
    const decoded = this.verifyToken(refreshToken, 'refresh');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new AppError(401, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    return {
      accessToken: this.generateToken(user.id, 'access'),
      refreshToken: this.generateToken(user.id, 'refresh')
    };
  }

  private static verifyToken(token: string, type: 'access' | 'refresh') {
    const secret = config.jwt.secret;
    try {
      return jwt.verify(token, secret) as { id: string };
    } catch (err) {
      throw new AppError(401, 
        type === 'access' 
          ? ERROR_MESSAGES.AUTH.TOKEN_INVALID 
          : 'Invalid refresh token'
      );
    }
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    const resetToken = jwt.sign(
      { id: user.id },
      config.jwt.secret + user.password,
      { expiresIn: '10m' }
    );

    const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message: `Submit a PATCH request with your new password to: ${resetUrl}`
    });
  }

  static async resetPassword(token: string, password: string) {
    // Implementation for password reset
  }
}

export default AuthService;