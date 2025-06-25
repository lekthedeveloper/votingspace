import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' }
  ]
});

prisma.$on('warn', (e) => logger.warn(e.message));
prisma.$on('info', (e) => logger.info(e.message));
prisma.$on('error', (e) => logger.error(e.message));

// Soft delete middleware
prisma.$use(async (params, next) => {
  // Soft delete for Room model
  if (params.model === 'Room' && params.action === 'delete') {
    return next({
      ...params,
      action: 'update',
      args: {
        ...params.args,
        data: { isClosed: true }
      }
    });
  }

  // Filter out deleted rooms by default
  if (params.model === 'Room' && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      isClosed: false
    };
  }

  return next(params);
});

export default prisma;