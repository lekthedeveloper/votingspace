import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import catchAsync from "../../utils/catchAsync"
import AppError from "../../utils/appError"

const prisma = new PrismaClient()

interface AuthenticatedRequest extends Request {
  user?: any
  isGuest?: boolean
}

class RoomController {
  // Join room by code - works for both authenticated and guest users
  static joinRoomByCode = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { joinCode } = req.body

    console.log("=== JOIN ROOM BY CODE CONTROLLER ===")
    console.log("Join code:", joinCode)
    console.log("User:", req.user)

    if (!joinCode) {
      return next(new AppError("Join code is required", 400))
    }

    // Find room by join code
    const room = await prisma.room.findFirst({
      where: {
        joinCode: joinCode.toUpperCase(),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!room) {
      return next(new AppError("Invalid join code. Room not found.", 404))
    }

    // Check if room is active
    if (!room.isActive) {
      return next(new AppError("This room is no longer accepting participants.", 400))
    }

    // Check if room has expired
    if (room.deadline && new Date() > room.deadline) {
      return next(new AppError("This room has expired and is no longer accepting participants.", 400))
    }

    console.log("✅ Room found and accessible:", {
      id: room.id,
      title: room.title,
      isActive: room.isActive,
      creatorId: room.creatorId,
    })

    // Return room details for navigation
    res.status(200).json({
      status: "success",
      message: "Successfully joined room",
      data: {
        room: {
          id: room.id,
          title: room.title,
          description: room.description,
          joinCode: room.joinCode,
          isActive: room.isActive,
          isAnonymous: room.isAnonymous,
          allowMultipleVotes: room.allowMultipleVotes,
          deadline: room.deadline,
          createdAt: room.createdAt,
          creator: room.creator,
        },
      },
    })
  })

  // Create room
  static createRoom = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { title, description, options, isAnonymous = true, allowMultipleVotes = false, endDate } = req.body
    const userId = req.user?.id

    if (!userId) {
      return next(new AppError("You must be logged in to create a room", 401))
    }

    // Generate unique join code
    const generateJoinCode = () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    let joinCode = generateJoinCode()
    let isUnique = false
    let attempts = 0

    // Ensure join code is unique
    while (!isUnique && attempts < 10) {
      const existingRoom = await prisma.room.findFirst({
        where: { joinCode },
      })

      if (!existingRoom) {
        isUnique = true
      } else {
        joinCode = generateJoinCode()
        attempts++
      }
    }

    if (!isUnique) {
      return next(new AppError("Failed to generate unique join code. Please try again.", 500))
    }

    const room = await prisma.room.create({
      data: {
        title,
        description,
        options,
        isAnonymous,
        allowMultipleVotes,
        deadline: endDate ? new Date(endDate) : null,
        joinCode,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    res.status(201).json({
      status: "success",
      message: "Room created successfully",
      data: { room },
    })
  })

  // Get room details
  static getRoomDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { roomId } = req.params

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: { room },
    })
  })

  // Get user's rooms
  static getUserRooms = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id

    if (!userId) {
      return next(new AppError("You must be logged in to view your rooms", 401))
    }

    const rooms = await prisma.room.findMany({
      where: { creatorId: userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Add computed fields
    const roomsWithStats = rooms.map((room) => ({
      ...room,
      totalVotes: room._count.votes,
    }))

    res.status(200).json({
      status: "success",
      results: rooms.length,
      data: { rooms: roomsWithStats },
    })
  })

  // Update room
  static updateRoom = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { roomId } = req.params
    const { title, description, isAnonymous, allowMultipleVotes, endDate } = req.body
    const userId = req.user?.id

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    if (room.creatorId !== userId) {
      return next(new AppError("You can only update your own rooms", 403))
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        title,
        description,
        isAnonymous,
        allowMultipleVotes,
        deadline: endDate ? new Date(endDate) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    res.status(200).json({
      status: "success",
      message: "Room updated successfully",
      data: { room: updatedRoom },
    })
  })

  // Delete room
  static deleteRoom = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { roomId } = req.params
    const userId = req.user?.id

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    if (room.creatorId !== userId) {
      return next(new AppError("You can only delete your own rooms", 403))
    }

    await prisma.room.delete({
      where: { id: roomId },
    })

    res.status(204).json({
      status: "success",
      data: null,
    })
  })

  // Close room
  static closeRoom = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { roomId } = req.params
    const userId = req.user?.id

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return next(new AppError("Room not found", 404))
    }

    if (room.creatorId !== userId) {
      return next(new AppError("You can only close your own rooms", 403))
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { isActive: false },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    res.status(200).json({
      status: "success",
      message: "Room closed successfully",
      data: { room: updatedRoom },
    })
  })
}

export default RoomController
