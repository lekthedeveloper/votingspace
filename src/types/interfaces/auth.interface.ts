import { Request } from 'express';
import { UserRole } from '../enums/user.role.enum';

export interface UserPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface UserRequest extends Request {
  user?: UserPayload;
  cookies: {
    jwt?: string;
    anonymousId?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}