import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import catchAsync from "../utils/catchAsync"
import AppError from "../utils/appError"
import config from "../config/config"
import type { UserRole } from "../types/enums/user.role.enum"

const prisma = new PrismaClient()

interface JwtPayload {
  userId: string  // Changed from 'id' to 'userId'
  email: string
  role: string
  iat: number
  exp: number
}

interface AuthenticatedRequest extends Request {
  user?: any
  isGuest?: boolean
}

// Protect routes - require authentication
export const protect = (options: { allowGuests?: boolean } = {}) => {
  return catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1) Getting token and check if it's there
    let token: string | undefined

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt
    }

    // If no token and guests are allowed, mark as guest and continue
    if (!token && options.allowGuests) {
      req.isGuest = true
      return next()
    }

    if (!token) {
      return next(new AppError("You are not logged in! Please log in to get access.", 401))
    }

    // 2) Verification token
    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload
    } catch (error) {
      return next(new AppError("Invalid token. Please log in again.", 401))
    }

    // Check if decoded has the required userId field
    if (!decoded.userId) {
      return next(new AppError("Invalid token structure. Please log in again.", 401))
    }

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },  // Changed from decoded.id to decoded.userId
    })

    if (!currentUser) {
      return next(new AppError("The user belonging to this token does no longer exist.", 401))
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000)
      if (decoded.iat < changedTimestamp) {
        return next(new AppError("User recently changed password! Please log in again.", 401))
      }
    }

    // Grant access to protected route
    req.user = currentUser
    next()
  })
}

// Allow guests - for routes that can work with or without authentication
export const allowGuests = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // This middleware just passes through - the actual logic is in protect()
  next()
}

// Restrict to certain roles
export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You must be logged in to access this resource.", 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403))
    }

    next()
  }
}

// Check if user is logged in (for rendered pages)
export const isLoggedIn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify token
      let decoded: JwtPayload
      try {
        decoded = jwt.verify(req.cookies.jwt, config.jwtSecret) as JwtPayload
      } catch (error) {
        return next()
      }

      // Check if decoded has the required userId field
      if (!decoded.userId) {
        return next()
      }

      // 2) Check if user still exists
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.userId },  // Changed from decoded.id to decoded.userId
      })

      if (!currentUser) {
        return next()
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.passwordChangedAt) {
        const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000)
        if (decoded.iat < changedTimestamp) {
          return next()
        }
      }

      // There is a logged in user
      req.user = currentUser
      return next()
    }
  } catch (error) {
    return next()
  }
  next()
}