import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { PAGINATION } from '../config/constants';

export class APIFeatures<T> {
  constructor(
    public query: Prisma.Sql,
    private reqQuery: Request['query']
  ) {}

  paginate(): this {
    const page = Number(this.reqQuery.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Number(this.reqQuery.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    this.query = Prisma.sql`${this.query} LIMIT ${limit} OFFSET ${skip}`;
    return this;
  }

  filter(): this {
    const queryObj = { ...this.reqQuery };
    const excludedFields = ['page', 'limit', 'sort'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Basic filtering
    if (Object.keys(queryObj).length > 0) {
      const filters = Object.entries(queryObj)
        .map(([key, value]) => Prisma.sql`${Prisma.raw(key)} = ${value}`)
        .join(' AND ');

      this.query = Prisma.sql`${this.query} WHERE ${Prisma.raw(filters)}`;
    }

    return this;
  }

  sort(): this {
    if (this.reqQuery.sort) {
      const sortBy = (this.reqQuery.sort as string).split(',').join(' ');
      this.query = Prisma.sql`${this.query} ORDER BY ${Prisma.raw(sortBy)}`;
    } else {
      this.query = Prisma.sql`${this.query} ORDER BY created_at DESC`;
    }

    return this;
  }
}

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};