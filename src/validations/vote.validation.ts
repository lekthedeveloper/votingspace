import { z } from "zod"

// CUID validation regex (Prisma's default ID format)
const cuidRegex = /^c[a-z0-9]{24}$/

export const submitVoteSchema = z.object({
  params: z.object({
    roomId: z.string().regex(cuidRegex, "Invalid room ID"),
  }),
  body: z.object({
    option: z.string().min(1, "Option is required"),
    justification: z.string().optional(),
  }),
  query: z.object({}).optional(),
})

export const removeVoteSchema = z.object({
  params: z.object({
    voteId: z.string().regex(cuidRegex, "Invalid vote ID"),
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const getUserVoteSchema = z.object({
  params: z.object({
    roomId: z.string().regex(cuidRegex, "Invalid room ID"),
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
})

export type SubmitVoteInput = z.infer<typeof submitVoteSchema>["body"]
export type RemoveVoteInput = z.infer<typeof removeVoteSchema>["params"]
export type GetUserVoteInput = z.infer<typeof getUserVoteSchema>["params"]

export default {
  submitVoteSchema,
  removeVoteSchema,
  getUserVoteSchema,
}
