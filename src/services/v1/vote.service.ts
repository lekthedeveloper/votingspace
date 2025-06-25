import prisma from '../../models/prisma.client';
import { AppError } from '../../utils/appError';
import { ERROR_MESSAGES } from '../../config/constants';
import logger from '../../utils/logger';

class VoteService {
  static async castVote(
    roomId: string,
    option: string,
    voterId?: string,
    isGuest = false
  ) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { votes: true }
    });

    if (!room) {
      throw new AppError(404, ERROR_MESSAGES.ROOM.NOT_FOUND);
    }

    if (room.isClosed || new Date() > new Date(room.deadline)) {
      throw new AppError(400, ERROR_MESSAGES.ROOM.VOTING_CLOSED);
    }

    if (!room.options.includes(option)) {
      throw new AppError(400, ERROR_MESSAGES.VOTE.INVALID_OPTION);
    }

    const existingVote = room.votes.find(vote => 
      (voterId && !isGuest && vote.userId === voterId) || 
      (voterId && isGuest && vote.guestId === voterId)
    );

    if (existingVote) {
      throw new AppError(400, ERROR_MESSAGES.VOTE.ALREADY_VOTED);
    }

    const voteData: any = {
      roomId,
      option,
      [isGuest ? 'guestId' : 'userId']: voterId
    };

    const vote = await prisma.vote.create({
      data: voteData
    });

    logger.info(`New vote cast in room ${roomId} for option ${option}`);

    return vote;
  }

  static async getVotes(roomId: string) {
    return await prisma.vote.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getVoteStats(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { votes: true }
    });

    if (!room) {
      throw new AppError(404, ERROR_MESSAGES.ROOM.NOT_FOUND);
    }

    return {
      totalVotes: room.votes.length,
      options: room.options.map(option => ({
        option,
        count: room.votes.filter(v => v.option === option).length,
        percentage: (room.votes.filter(v => v.option === option).length / room.votes.length) * 100 || 0
      }))
    };
  }

  static async invalidateVote(voteId: string, userId: string) {
    const vote = await prisma.vote.findUnique({
      where: { id: voteId },
      include: { room: true }
    });

    if (!vote) {
      throw new AppError(404, 'Vote not found');
    }

    if (vote.room.creatorId !== userId) {
      throw new AppError(403, ERROR_MESSAGES.ROOM.NOT_CREATOR);
    }

    await prisma.vote.delete({ where: { id: voteId } });
  }
}

export default VoteService;