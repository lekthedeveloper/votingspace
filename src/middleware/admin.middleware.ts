import type { Request, Response, NextFunction } from "express"
import fs from "fs"
import path from "path"

interface AdminRequest extends Request {
  isAdmin?: boolean
}

// Admin credentials from environment
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "lekadeyemi",
  password: process.env.ADMIN_PASSWORD || "Quinn123",
}

export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  // Check if already authenticated via session
  if (req.session?.isAdmin) {
    req.isAdmin = true
    return next()
  }

  // Check for POST login request
  if (req.method === "POST" && req.body.username && req.body.password) {
    const { username, password } = req.body

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      req.isAdmin = true
      if (req.session) {
        req.session.isAdmin = true
      }
      return next()
    } else {
      // Invalid credentials - show login with error
      return res.status(401).send(getLoginPage("Invalid credentials. Please check your username and password."))
    }
  }

  // Show login page
  res.status(401).send(getLoginPage())
}

function getLoginPage(error?: string) {
  try {
    const loginPath = path.join(__dirname, "../views/admin/login.html")
    let html = fs.readFileSync(loginPath, "utf8")

    // Replace error placeholder
    const errorHtml = error
      ? `
      <div class="error-message">
        ${error}
      </div>
      `
      : ""

    html = html.replace("{{ERROR_MESSAGE}}", errorHtml)
    return html
  } catch (err) {
    console.error("Error reading login.html:", err)
    return `
      <html>
        <body>
          <h1>Admin Login</h1>
          <p>Error loading login page. Please check server configuration.</p>
          ${error ? `<p style="color: red;">${error}</p>` : ""}
        </body>
      </html>
    `
  }
}

export function getDashboardPage(data: any) {
  try {
    // Try multiple possible paths for the dashboard.html file
    const possiblePaths = [
      path.join(__dirname, "../views/admin/dashboard.html"),
      path.join(__dirname, "../../views/admin/dashboard.html"),
      path.join(process.cwd(), "views/admin/dashboard.html"),
      path.join(process.cwd(), "src/views/admin/dashboard.html"),
    ]

    let html = ""
    let dashboardPath = ""

    // Try to find the dashboard.html file
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        dashboardPath = testPath
        html = fs.readFileSync(testPath, "utf8")
        console.log(`✅ Found dashboard.html at: ${testPath}`)
        break
      } else {
        console.log(`❌ Dashboard not found at: ${testPath}`)
      }
    }

    if (!html) {
      throw new Error("dashboard.html file not found in any expected location")
    }

    // API Performance Metrics
    html = html.replace("{{RESPONSE_TIME}}", data.performance?.responseTime?.toString() || "0")
    html = html.replace("{{REQUEST_COUNT}}", data.performance?.requestCount?.toLocaleString() || "0")
    html = html.replace("{{ERROR_RATE}}", data.performance?.errorRate?.toFixed(1) || "0.0")
    html = html.replace("{{ACTIVE_CONNECTIONS}}", data.performance?.activeConnections?.toString() || "0")

    // System info
    const uptime = data.systemInfo?.uptime
      ? `${Math.floor(data.systemInfo.uptime / 3600)}h ${Math.floor((data.systemInfo.uptime % 3600) / 60)}m`
      : "Unknown"
    html = html.replace("{{UPTIME}}", uptime)
    html = html.replace("{{ENVIRONMENT}}", data.systemInfo?.environment || "Unknown")
    html = html.replace("{{NODE_VERSION}}", data.systemInfo?.nodeVersion || "Unknown")
    html = html.replace("{{PLATFORM}}", data.systemInfo?.platform || "Unknown")
    html = html.replace(
      "{{MEMORY_USED}}",
      data.systemInfo?.memory?.heapUsed ? Math.round(data.systemInfo.memory.heapUsed / 1024 / 1024).toString() : "0",
    )
    html = html.replace(
      "{{MEMORY_TOTAL}}",
      data.systemInfo?.memory?.heapTotal ? Math.round(data.systemInfo.memory.heapTotal / 1024 / 1024).toString() : "0",
    )
    html = html.replace("{{CPU_USAGE}}", data.systemInfo?.cpuUsage?.toFixed(1) || "0.0")
    html = html.replace("{{API_VERSION}}", data.systemInfo?.apiVersion || "1.0.0")

    return html
  } catch (err) {
    console.error("Error reading dashboard.html:", err)
    console.error("Current working directory:", process.cwd())
    console.error("__dirname:", __dirname)
    
    return `
      <html>
        <head>
          <title>Admin Dashboard - Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Admin Dashboard</h1>
          <div class="error">
            <h3>Error loading dashboard</h3>
            <p><strong>Error:</strong> ${err.message}</p>
            <p><strong>Current directory:</strong> ${process.cwd()}</p>
            <p><strong>Looking for dashboard.html in:</strong></p>
            <ul>
              <li>${path.join(__dirname, "../views/admin/dashboard.html")}</li>
              <li>${path.join(__dirname, "../../views/admin/dashboard.html")}</li>
              <li>${path.join(process.cwd(), "views/admin/dashboard.html")}</li>
              <li>${path.join(process.cwd(), "src/views/admin/dashboard.html")}</li>
            </ul>
            <p>Please create the dashboard.html file in one of these locations.</p>
          </div>
        </body>
      </html>
    `
  }
}