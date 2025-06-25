import { z } from "zod"

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    name: z.string().min(2, "Name must be at least 2 characters long"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email"),
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
      passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords don't match",
      path: ["passwordConfirm"],
    }),
  params: z.object({
    token: z.string().min(1, "Reset token is required"),
  }),
  query: z.object({}).optional(),
})

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>["body"]
export type LoginInput = z.infer<typeof loginSchema>["body"]
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"]
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"]
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"]

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
}
