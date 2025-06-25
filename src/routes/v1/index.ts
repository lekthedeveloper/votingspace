import type { Application } from "express"
import authRoutes from "./auth.routes"
import roomRoutes from "./room.routes"
import voteRoutes from "./vote.routes"

export const setupRoutes = (app: Application): void => {
  // API v1 routes
  app.use("/api/v1/auth", authRoutes)
  app.use("/api/v1/rooms", roomRoutes)
  app.use("/api/v1/votes", voteRoutes)

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    })
  })

  // API info endpoint
  app.get("/api/v1", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Voting App API v1",
      version: "1.0.0",
      endpoints: {
        auth: "/api/v1/auth",
        rooms: "/api/v1/rooms",
        votes: "/api/v1/votes",
      },
    })
  })

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      status: "error",
      message: `Route ${req.originalUrl} not found`,
    })
  })

  // Root endpoint
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Welcome to Voting App API",
      version: "1.0.0",
      documentation: "/api/v1",
    })
  })
}
