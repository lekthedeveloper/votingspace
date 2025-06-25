import type { Request, Response, NextFunction } from "express"
import type { z } from "zod"
import { AppError } from "../utils/appError"

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("=== VALIDATION MIDDLEWARE START ===")
    console.log("Request URL:", req.url)
    console.log("Request Method:", req.method)
    console.log("Request Params:", req.params)
    console.log("Request Body:", req.body)
    console.log("Request Query:", req.query)

    try {
      // Always use wrapped structure for consistency
      const validationData = {
        body: req.body || {},
        params: req.params || {},
        query: req.query || {},
      }

      console.log("Validation data structure:", validationData)

      const validationResult = schema.safeParse(validationData)

      if (!validationResult.success) {
        console.log("❌ VALIDATION FAILED:")
        console.log("Validation errors:", JSON.stringify(validationResult.error.errors, null, 2))

        // Format validation errors
        const errors = validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))

        const errorMessage = errors.map((err) => `${err.field}: ${err.message}`).join(", ")
        return next(new AppError(`Validation failed: ${errorMessage}`, 400))
      }

      console.log("✅ VALIDATION PASSED")

      // Update request with validated data
      req.body = validationResult.data.body
      req.params = validationResult.data.params
      req.query = validationResult.data.query

      next()
    } catch (error) {
      console.error("❌ VALIDATION MIDDLEWARE EXCEPTION:", error)
      next(new AppError("Validation error occurred", 500))
    }
  }
}
