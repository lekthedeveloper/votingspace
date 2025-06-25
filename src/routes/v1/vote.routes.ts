import { Router } from "express"
import { validate } from "../../middleware/validate.middleware"
import { submitVoteSchema, removeVoteSchema, getUserVoteSchema } from "../../validations/vote.validation"
import VoteController from "../../controllers/v1/vote.controller"
import { protect } from "../../middleware/auth.middleware"
import { voteLimiter } from "../../middleware/rateLimiting.middleware"

const router = Router()

// Public routes (no authentication required)
// Submit a vote - roomId is in params, vote data in body
router.post("/:roomId", voteLimiter, validate(submitVoteSchema), VoteController.castVote)

// Get vote results for a room
router.get("/:roomId/results", validate(getUserVoteSchema), VoteController.getVoteResults)

// NEW: Check vote status for current user/guest in a room (public)
router.get("/:roomId/status", validate(getUserVoteSchema), VoteController.getVoteStatus)

// Protected routes (authentication required)
router.use(protect())

// Get user's vote for a room
router.get("/:roomId/my-vote", validate(getUserVoteSchema), VoteController.getUserVoteInRoom)

// Get user's all votes
router.get("/my-votes", VoteController.getUserVotes)

// Remove a vote
router.delete("/:voteId", validate(removeVoteSchema), VoteController.removeVote)

export default router
