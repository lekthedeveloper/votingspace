import prisma from '../../models/prisma.client';
import { AppError } from '../../utils/appError';
import { ERROR_MESSAGES } from '../../config/constants';
import { Room, Prisma } from '@prisma/client';
import logger from '../../utils/logger';

class RoomService {
  static async createRoom(roomData: {
    title: string;
    description: string;
    options: string[];
    deadline: Date;
    creatorId: string;
  }): Promise<Room> {
    try {
      return await prisma.room.create({
        data: {
          title: roomData.title,
          description: roomData.description,
          options: roomData.options,
          deadline: roomData.deadline,
          creatorId: roomData.creatorId
        }
      });
    } catch (error) {
      logger.error('Error creating room:', error);
      throw new AppError(400, ERROR_MESSAGES.ROOM.CREATION_FAILED);
    }
  }

  static async getRoom(roomId: string): Promise<Room | null> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        votes: true
      }
    });

    if (!room) {
      throw new AppError(404, ERROR_MESSAGES.ROOM.NOT_FOUND);
    }

    return room;
  }

  static async getUserRooms(userId: string): Promise<Room[]> {
    return await prisma.room.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAllRooms(page: number, limit: number): Promise<Room[]> {
    return await prisma.room.findMany({
      where: { isClosed: false },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async closeRoom(roomId: string, userId: string): Promise<void> {
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      throw new AppError(404, ERROR_MESSAGES.ROOM.NOT_FOUND);
    }

    if (room.creatorId !== userId) {
      throw new AppError(403, ERROR_MESSAGES.ROOM.NOT_CREATOR);
    }

    await prisma.room.update({
      where: { id: roomId },
      data: { isClosed: true }
    });
  }

  static async getRoomResults(roomId: string) {
    const room = await this.getRoom(roomId);
    
    const results = room.options.map(option => ({
      option,
      votes: room.votes.filter(v => v.option === option).length
    }));

    return {
      roomId: room.id,
      title: room.title,
      totalVotes: room.votes.length,
      results,
      isClosed: room.isClosed || new Date() > new Date(room.deadline)
    };
  }
}

export default RoomService;