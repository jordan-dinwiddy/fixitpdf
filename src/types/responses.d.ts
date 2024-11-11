import { Prisma } from '@prisma/client';

export interface BaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
