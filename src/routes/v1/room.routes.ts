import { Router } from "express"
import { validate } from "../../middleware/validate.middleware"
import { createRoomSchema, updateRoomSchema } from "../../validations/room.validation"
import RoomController from "../../controllers/v1/room.controller"
import { protect } from "../../middleware/auth.middleware"
import { roomLimiter } from "../../middleware/rateLimiting.middleware"

const router = Router()

// Public routes (no authentication required)
// Get room details - anyone can view
router.get("/:roomId", RoomController.getRoomDetails)

// Join room by code - works for both authenticated and guest users
router.post("/join", RoomController.joinRoomByCode)

// Protected routes (authentication required)
router.use(protect())

// Create room
router.post("/", roomLimiter, validate(createRoomSchema), RoomController.createRoom)

// Get user's rooms
router.get("/", RoomController.getUserRooms)

// Update room
router.patch("/:roomId", validate(updateRoomSchema), RoomController.updateRoom)

// Delete room
router.delete("/:roomId", RoomController.deleteRoom)

// Close room
router.patch("/:roomId/close", RoomController.closeRoom)

export default router
