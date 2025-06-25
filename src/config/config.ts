import dotenv from "dotenv"

dotenv.config()

interface Config {
  port: number
  nodeEnv: string
  databaseUrl: string
  jwtSecret: string
  jwtExpiresIn: string
  frontendUrl: string
}

const config: Config = {
  port: Number.parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
}

export default config
