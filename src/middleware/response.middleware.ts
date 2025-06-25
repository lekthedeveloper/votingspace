import type { Request, Response, NextFunction } from "express"

export const formatResponse = (req: Request, res: Response, next: NextFunction) => {
  // Store the original json method
  const originalJson = res.json

  // Override the json method
  res.json = function (body: any) {
    // If the response already has a status and data structure, don't modify it
    if (body && typeof body === "object" && (body.status || body.success !== undefined)) {
      return originalJson.call(this, body)
    }

    // Check if body is a string (likely an error message being passed incorrectly)
    if (typeof body === "string") {
      // Don't try to use string as status code, format it properly
      const formattedResponse = {
        status: res.statusCode >= 400 ? "error" : "success",
        timestamp: new Date().toISOString(),
        message: body,
        data: null,
      }
      return originalJson.call(this, formattedResponse)
    }

    // Format the response for normal cases
    const formattedResponse = {
      status: res.statusCode >= 400 ? "error" : "success",
      timestamp: new Date().toISOString(),
      data: body,
    }

    return originalJson.call(this, formattedResponse)
  }

  next()
}