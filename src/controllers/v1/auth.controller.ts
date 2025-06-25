import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';

const prisma = new PrismaClient();

class AuthController {
  // Register new user
  register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return next(AppError.conflict('User with this email already exists'));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  });

  // Login user
  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(AppError.unauthorized('Invalid email or password'));
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  });

  // Refresh access token
  refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const cookieRefreshToken = req.cookies?.refreshToken;

    const token = refreshToken || cookieRefreshToken;

    if (!token) {
      return next(AppError.unauthorized('Refresh token not provided'));
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(token, this.getRefreshSecret()) as { userId: string };

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });

      if (!user) {
        return next(AppError.unauthorized('User no longer exists'));
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user.id);

      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        status: 'success',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      return next(AppError.unauthorized('Invalid or expired refresh token'));
    }
  });

  // Logout user
  logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });

  // Forgot password
  forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(AppError.notFound('No user found with that email address'));
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset functionality will be implemented after adding required database fields'
    });
  });

  // Reset password
  resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      message: 'Password reset functionality will be implemented after adding required database fields'
    });
  });

  // Helper methods with error handling
  private generateAccessToken(user: any): string {
    const secret = this.getJwtSecret();
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  private generateRefreshToken(userId: string): string {
    const secret = this.getRefreshSecret();
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  private getRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return secret;
  }
}

export default new AuthController();