import { z } from "zod"
import { ROOM } from "../config/constants"

// CUID validation regex
const cuidRegex = /^c[a-z0-9]{24}$/

const optionValidation = z
  .string()
  .min(1, "Option cannot be empty")
  .max(ROOM.MAX_OPTION_LENGTH, `Option must be less than ${ROOM.MAX_OPTION_LENGTH} characters`)

export const createRoomSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(ROOM.MAX_TITLE_LENGTH, `Title must be less than ${ROOM.MAX_TITLE_LENGTH} characters`),

    description: z
      .string()
      .min(1, "Description is required")
      .max(ROOM.MAX_DESCRIPTION_LENGTH, `Description must be less than ${ROOM.MAX_DESCRIPTION_LENGTH} characters`),

    options: z
      .array(optionValidation)
      .min(ROOM.MIN_OPTIONS, `Must have at least ${ROOM.MIN_OPTIONS} options`)
      .max(ROOM.MAX_OPTIONS, `Cannot have more than ${ROOM.MAX_OPTIONS} options`)
      .refine((options) => new Set(options).size === options.length, {
        message: "Options must be unique",
      }),

    isAnonymous: z.boolean().optional().default(true),
    allowMultipleVotes: z.boolean().optional().default(false),
    endDate: z
      .string()
      .datetime({ offset: true })
      .refine((date) => new Date(date) > new Date(), {
        message: "End date must be in the future",
      })
      .optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().regex(cuidRegex, "Invalid room ID"),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(1, "Title is required")
        .max(ROOM.MAX_TITLE_LENGTH, `Title must be less than ${ROOM.MAX_TITLE_LENGTH} characters`)
        .optional(),

      description: z
        .string()
        .min(1, "Description is required")
        .max(ROOM.MAX_DESCRIPTION_LENGTH, `Description must be less than ${ROOM.MAX_DESCRIPTION_LENGTH} characters`)
        .optional(),

      options: z
        .array(optionValidation)
        .min(ROOM.MIN_OPTIONS, `Must have at least ${ROOM.MIN_OPTIONS} options`)
        .max(ROOM.MAX_OPTIONS, `Cannot have more than ${ROOM.MAX_OPTIONS} options`)
        .refine((options) => new Set(options).size === options.length, {
          message: "Options must be unique",
        })
        .optional(),

      isAnonymous: z.boolean().optional(),
      allowMultipleVotes: z.boolean().optional(),
      endDate: z
        .string()
        .datetime({ offset: true })
        .refine((date) => new Date(date) > new Date(), {
          message: "End date must be in the future",
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
  query: z.object({}).optional(),
})

export const roomIdSchema = z.object({
  params: z.object({
    id: z.string().regex(cuidRegex, "Invalid room ID"),
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional(),
})

export const joinRoomSchema = z.object({
  body: z.object({
    joinCode: z
      .string()
      .min(6, "Join code must be at least 6 characters")
      .max(8, "Join code must be at most 8 characters")
      .regex(/^[A-Z0-9]+$/, "Join code must contain only uppercase letters and numbers"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
})

// Type exports
export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"]
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>["body"]
export type RoomIdInput = z.infer<typeof roomIdSchema>["params"]
export type JoinRoomInput = z.infer<typeof joinRoomSchema>["body"]

export default {
  createRoomSchema,
  updateRoomSchema,
  roomIdSchema,
  joinRoomSchema,
}
