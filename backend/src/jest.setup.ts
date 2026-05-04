import { mockDeep, mockReset } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

const prisma = mockDeep<PrismaClient>()

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prisma),
  Prisma: {
    PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code?: string
      constructor(message: string, code?: string) {
        super(message)
        this.code = code
      }
    },
  },
}))

export { prisma, mockReset }
