/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();