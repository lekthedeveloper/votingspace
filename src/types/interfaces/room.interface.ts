import { Room, Vote, User } from '@prisma/client';

export interface RoomWithRelations extends Room {
  creator: Pick<User, 'id' | 'name' | 'email'>;
  votes: Vote[];
}

export interface RoomCreateData {
  title: string;
  description: string;
  options: string[];
  deadline: Date;
  creatorId: string;
}

export interface RoomResults {
  roomId: string;
  title: string;
  totalVotes: number;
  results: {
    option: string;
    votes: number;
  }[];
  isClosed: boolean;
}

export interface PaginatedRooms {
  data: RoomWithRelations[];
  page: number;
  limit: number;
  total: number;
}