import { Router } from "express"
import { adminAuth, getDashboardPage } from "../middleware/admin.middleware"
import { PrismaClient } from "@prisma/client"
import os from "os"

const router = Router()
const prisma = new PrismaClient()

// Root admin route - redirect to dashboard
router.get("/", (req, res) => {
  res.redirect("/admin/dashboard")
})

// Handle POST login requests for dashboard
router.post("/dashboard", adminAuth, (req, res) => {
  res.redirect("/admin/dashboard")
})

// Handle POST login requests for root admin
router.post("/", adminAuth, (req, res) => {
  res.redirect("/admin/dashboard")
})

// Apply admin authentication to all other routes
router.use(adminAuth)

// API Proxy routes for dashboard testing
router.get("/api/health", async (req, res) => {
  try {
    const response = await fetch('http://localhost:5005/health')
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to connect to API server",
      message: "Make sure the API server is running on localhost:5005"
    })
  }
})

router.get("/api/v1", async (req, res) => {
  try {
    const response = await fetch('http://localhost:5005/api/v1')
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to connect to API server",
      message: "Make sure the API server is running on localhost:5005"
    })
  }
})

// Admin Dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // Get API performance metrics instead of database stats
    const performance = {
      responseTime: 0, // Will be measured by frontend
      requestCount: 0, // You can implement request counting
      errorRate: 0.0,  // You can implement error tracking
      activeConnections: 0 // You can implement connection tracking
    }

    // System info
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: os.platform(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      cpuUsage: 0.0, // You can implement CPU monitoring
      apiVersion: "1.0.0"
    }

    const dashboardData = {
      performance,
      systemInfo,
    }

    res.send(getDashboardPage(dashboardData))
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).json({ error: "Failed to load dashboard" })
  }
})

// Logout route
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/admin/dashboard")
    })
  } else {
    res.redirect("/admin/dashboard")
  }
})

export default router