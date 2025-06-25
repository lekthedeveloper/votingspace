import rateLimit from "express-rate-limit"

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 5 requests per windowMs
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiting for voting endpoints
export const voteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // limit each IP to 10 votes per minute
  message: {
    status: "error",
    message: "Too many votes from this IP, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiting for room creation
export const roomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 room creations per hour
  message: {
    status: "error",
    message: "Too many rooms created from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
