import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import catchAsync from "../../utils/catchAsync"
import AppError from "../../utils/appError"

const prisma = new PrismaClient()

interface AuthenticatedRequest extends Request {
  user?: any
  isGuest?: boolean
}

class VoteController {
  // Cast a vote (public/protected)
  static castVote = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { option, justification } = req.body
    const { roomId } = req.params

    console.log("=== CAST VOTE CONTROLLER ===")
    console.log("Room ID from params:", roomId)
    console.log("Option from body:", option)
    console.log("User:", req.user)

    // Validate required fields
    if (!roomId) {
      return next(new AppError("Room ID is required", 400))
    }

    if (!option) {
      return next(new AppError("Option is required", 400))
    }

    // 🔥 FIXED: Proper guest/user separation
    const isAuthenticated = !!req.user?.id
    const userId = isAuthenticated ? req.user.id : null
    const guestId = !isAuthenticated ? req.cookies.anonymousId || `guest_${Date.now()}_${Math.random()}` : null

    console.log("Is Authenticated:", isAuthenticated)
    console.log("User ID:", userId)
    console.log("Guest ID:", guestId)

    // Check if room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    if (!room.isActive) {
      return next(new AppError("Voting is closed for this room", 400))
    }

    // Check if deadline has passed
    if (room.deadline && new Date() > room.deadline) {
      return next(new AppError("Voting deadline has passed", 400))
    }

    // Check if option is valid
    if (!room.options.includes(option)) {
      return next(new AppError("Invalid voting option", 400))
    }

    // Check if user is room creator
    if (isAuthenticated && room.creatorId === userId) {
      return next(new AppError("Room creators cannot vote in their own rooms", 403))
    }

    // 🔥 FIXED: Proper where clause for checking existing votes
    const whereClause: any = { roomId }

    if (isAuthenticated) {
      whereClause.userId = userId
      whereClause.guestId = null
    } else {
      whereClause.guestId = guestId
      whereClause.userId = null
    }

    console.log("Checking existing vote with where clause:", whereClause)

    const existingVote = await prisma.vote.findFirst({
      where: whereClause,
    })

    if (existingVote && !room.allowMultipleVotes) {
      return next(new AppError("You have already voted in this room", 400))
    }

    // 🔥 FIXED: Proper vote data creation
    const voteData: any = {
      roomId,
      option,
      userId: isAuthenticated ? userId : null, // ✅ null for guests
      guestId: !isAuthenticated ? guestId : null, // ✅ guest ID goes here
    }

    console.log("Creating vote with data:", voteData)

    try {
      const vote = await prisma.$transaction(async (tx) => {
        const doubleCheckVote = await tx.vote.findFirst({
          where: whereClause,
        })

        if (doubleCheckVote && !room.allowMultipleVotes) {
          throw new Error("You have already voted in this room")
        }

        return await tx.vote.create({
          data: voteData,
          include: {
            user: isAuthenticated ? true : false,
            room: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        })
      })

      // Set anonymous ID cookie if guest voting
      if (!isAuthenticated && !req.cookies.anonymousId) {
        res.cookie("anonymousId", guestId, {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
      }

      console.log("✅ Vote created successfully:", vote)

      res.status(201).json({
        status: "success",
        message: "Vote cast successfully",
        data: { vote },
      })
    } catch (error: any) {
      console.error("❌ Vote creation error:", error)

      if (error.message === "You have already voted in this room") {
        return next(new AppError("You have already voted in this room", 400))
      }

      return next(new AppError("Failed to cast vote. Please try again.", 500))
    }
  })

  // NEW: Check vote status for current user/guest in a room (public)
  static getVoteStatus = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { roomId } = req.params

    console.log("=== GET VOTE STATUS ===")
    console.log("Room ID:", roomId)
    console.log("User:", req.user)
    console.log("Cookies:", req.cookies)

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    const isAuthenticated = !!req.user?.id
    const userId = isAuthenticated ? req.user.id : null
    const guestId = !isAuthenticated ? req.cookies.anonymousId : null

    console.log("Is Authenticated:", isAuthenticated)
    console.log("User ID:", userId)
    console.log("Guest ID:", guestId)

    // If no user ID or guest ID, user can vote
    if (!userId && !guestId) {
      return res.status(200).json({
        status: "success",
        data: {
          hasVoted: false,
          canVote: true,
          userVote: null,
          room: {
            id: room.id,
            title: room.title,
            isActive: room.isActive,
            allowMultipleVotes: room.allowMultipleVotes,
            deadline: room.deadline,
            isCreator: false,
          },
          message: "You can cast your vote",
        },
      })
    }

    // Check if user is room creator
    const isCreator = isAuthenticated && room.creatorId === userId
    if (isCreator) {
      return res.status(200).json({
        status: "success",
        data: {
          hasVoted: false,
          canVote: false,
          userVote: null,
          room: {
            id: room.id,
            title: room.title,
            isActive: room.isActive,
            allowMultipleVotes: room.allowMultipleVotes,
            deadline: room.deadline,
            isCreator: true,
          },
          message: "Room creators cannot vote in their own rooms",
        },
      })
    }

    // Build where clause for finding existing vote
    const whereClause: any = { roomId }
    if (isAuthenticated) {
      whereClause.userId = userId
      whereClause.guestId = null
    } else {
      whereClause.guestId = guestId
      whereClause.userId = null
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findFirst({
      where: whereClause,
      include: {
        user: isAuthenticated ? { select: { id: true, name: true } } : false,
      },
    })

    const hasVoted = !!existingVote
    const canVote = !hasVoted || room.allowMultipleVotes

    // Check if voting is still allowed
    const votingClosed = !room.isActive || (room.deadline && new Date() > room.deadline)

    res.status(200).json({
      status: "success",
      data: {
        hasVoted,
        canVote: canVote && !votingClosed,
        userVote: existingVote
          ? {
              id: existingVote.id,
              option: existingVote.option,
              createdAt: existingVote.createdAt,
            }
          : null,
        room: {
          id: room.id,
          title: room.title,
          isActive: room.isActive,
          allowMultipleVotes: room.allowMultipleVotes,
          deadline: room.deadline,
          isCreator: false,
        },
        message:
          hasVoted && !room.allowMultipleVotes
            ? "You have already voted in this room"
            : votingClosed
              ? "Voting is closed for this room"
              : "You can cast your vote",
      },
    })
  })

  // Get vote results (public)
  static getVoteResults = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { roomId } = req.params

    console.log("=== GET VOTE RESULTS ===")
    console.log("Room ID:", roomId)

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    // Get all votes for this room
    const votes = await prisma.vote.findMany({
      where: { roomId },
    })

    const totalVotes = votes.length

    // Count votes for each option
    const votesByOption: Record<string, number> = {}
    votes.forEach((vote) => {
      votesByOption[vote.option] = (votesByOption[vote.option] || 0) + 1
    })

    // Create results for each room option
    const results = room.options.map((option, index) => ({
      id: `option-${index}`,
      text: option,
      voteCount: votesByOption[option] || 0,
      percentage: totalVotes > 0 ? Math.round(((votesByOption[option] || 0) / totalVotes) * 100) : 0,
    }))

    console.log("Vote results:", results)

    res.status(200).json({
      status: "success",
      data: {
        room: {
          id: room.id,
          title: room.title,
          totalVotes,
          results,
        },
      },
    })
  })

  // Get user's votes (protected)
  static getUserVotes = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      return next(new AppError("You must be logged in to view your votes", 401))
    }

    const votes = await prisma.vote.findMany({
      where: { userId },
      include: {
        room: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json({
      status: "success",
      results: votes.length,
      data: { votes },
    })
  })

  // Get user's vote in specific room (protected)
  static getUserVoteInRoom = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { roomId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return next(new AppError("You must be logged in to view your vote", 401))
    }

    const vote = await prisma.vote.findFirst({
      where: {
        roomId,
        userId,
      },
    })

    res.status(200).json({
      status: "success",
      data: { vote },
    })
  })

  // Remove a vote (protected)
  static removeVote = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { voteId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return next(new AppError("You must be logged in to remove a vote", 401))
    }

    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
    })

    if (!vote) {
      return next(new AppError("Vote not found", 404))
    }

    if (vote.userId !== userId) {
      return next(new AppError("You can only remove your own votes", 403))
    }

    await prisma.vote.delete({
      where: { id: voteId },
    })

    res.status(204).json({
      status: "success",
      data: null,
    })
  })
}

export default VoteController
