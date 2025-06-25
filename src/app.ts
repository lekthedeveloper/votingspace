import express from "express"
import session from "express-session"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import mongoSanitize from "express-mongo-sanitize"
import hpp from "hpp"
import { xss } from "express-xss-sanitizer"
import { setupRoutes } from "./routes/v1"
import { setupSwagger } from "./config/swagger"
import adminRoutes from "./routes/admin.routes"
import errorHandler from "./middleware/error.middleware"
import { formatResponse } from "./middleware/response.middleware"
import { apiLimiter } from "./middleware/rateLimiting.middleware"
import config from "./config/config"

const app = express()

// Trust proxy
app.set("trust proxy", 1)

// Session middleware for admin authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Updated CORS configuration
app.use(
  cors({
    origin: [
      config.frontendUrl || "http://localhost:3000",
      "http://localhost:5000",
      "http://localhost:5005",
      "http://localhost:5173", // Vite default port
      "http://127.0.0.1:5000",
      "http://127.0.0.1:5005",
      "http://127.0.0.1:5173",
      "https://72cc-102-89-33-198.ngrok-free.app/",
      "https://rad-eclair-715322.netlify.app", // Your Netlify URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "ngrok-skip-browser-warning", // Add this for ngrok
      "Accept",
    ],
  }),
)

// Add explicit OPTIONS handling for preflight requests
app.options("*", cors())

app.use(helmet())

// Body parsing middleware - REMOVE THE DEBUG LOGS TO CLEAN UP
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

// Rate limiting
app.use("/api", apiLimiter)

// Response formatting middleware
app.use(formatResponse)

// Setup protected Swagger documentation
setupSwagger(app)

// Admin routes (protected)
app.use("/admin", adminRoutes)

// API routes
setupRoutes(app)

// Global error handling middleware (must be last)
app.use(errorHandler)

export default app
