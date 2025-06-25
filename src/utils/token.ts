import jwt from 'jsonwebtoken';
import { Response } from 'express';
import config from '../config/config';
import { AuthTokens } from '../types/interfaces/auth.interface';
import { User } from '@prisma/client';

export const createSendToken = (
  user: User,
  tokens: AuthTokens,
  statusCode: number,
  res: Response,
  message?: string
) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', tokens.accessToken, cookieOptions);

  // Remove password from output
  delete (user as any).password;

  res.status(statusCode).json({
    status: 'success',
    message,
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as { id: string; iat: number; exp: number };
};