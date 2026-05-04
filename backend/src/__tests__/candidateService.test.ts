import { beforeEach, describe, expect, test } from '@jest/globals'
import { prisma, mockReset } from '../jest.setup'

beforeEach(() => {
  mockReset(prisma)
})

describe('addCandidate Service', () => {
  test('happy path with valid data returns saved candidate', async () => {
    // We need to mock the Candidate model and other models
    // For this test, we'll test the actual service by mocking Prisma directly

    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '612345678',
      address: 'Calle Mayor 1',
    }

    // Mock Prisma candidate.create to return a saved candidate
    prisma.candidate.create.mockResolvedValue({
      id: 1,
      ...mockCandidateData,
    })
    prisma.education.create.mockResolvedValue({ id: 1 } as any)
    prisma.workExperience.create.mockResolvedValue({ id: 1 } as any)
    prisma.resume.create.mockResolvedValue({ id: 1 } as any)

    // Import and call the actual service
    const { addCandidate } = require('../application/services/candidateService')
    const result = await addCandidate(mockCandidateData)

    expect(result).toBeDefined()
    expect(result.id).toBe(1)
    expect(result.firstName).toBe('Juan')
    expect(prisma.candidate.create).toHaveBeenCalled()
  })

  test('with educations saves education records', async () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      educations: [
        { institution: 'MIT', title: 'CS', startDate: '2020-01-01' },
      ],
    }

    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    } as any)
    prisma.education.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    await addCandidate(mockCandidateData)

    expect(prisma.education.create).toHaveBeenCalled()
  })

  test('validation error throws before any Prisma call', async () => {
    const invalidData = {
      firstName: 'J', // too short - should fail validation
      lastName: 'Pérez',
      email: 'invalid-email',
    }

    const { addCandidate } = require('../application/services/candidateService')
    
    await expect(addCandidate(invalidData)).rejects.toThrow()
    // Prisma should not have been called because validation fails first
    expect(prisma.candidate.create).not.toHaveBeenCalled()
  })

  test('duplicate email (P2002) throws specific message', async () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    }

    const p2002Error = new Error('Unique constraint failed')
    ;(p2002Error as any).code = 'P2002'
    prisma.candidate.create.mockRejectedValue(p2002Error)

    const { addCandidate } = require('../application/services/candidateService')
    
    await expect(addCandidate(mockCandidateData)).rejects.toThrow('email already exists')
  })

  test('with workExperiences saves work experience records', async () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      workExperiences: [
        { company: 'Acme', position: 'Dev', startDate: '2020-01-01' },
      ],
    }

    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    } as any)
    prisma.workExperience.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    await addCandidate(mockCandidateData)

    expect(prisma.workExperience.create).toHaveBeenCalled()
  })

  test('with CV saves resume record', async () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      cv: { filePath: '/path/to/cv.pdf', fileType: 'application/pdf' },
    }

    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    } as any)
    prisma.resume.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    await addCandidate(mockCandidateData)

    expect(prisma.resume.create).toHaveBeenCalled()
  })

  test('returns candidate without relations in response - Bug #2', async () => {
    // This test demonstrates Bug #2: the response doesn't include relations
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      educations: [
        { institution: 'MIT', title: 'CS', startDate: '2020-01-01' },
      ],
    }

    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    } as any)
    prisma.education.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    const result = await addCandidate(mockCandidateData)

    // BUG #2: The returned candidate does NOT include the educations
    // Even though they were saved to the database, they don't appear in the response
    // This happens because savedCandidate is returned from candidate.save() which
    // doesn't include manually-saved relations
    expect(result).not.toHaveProperty('educations')
    expect(result).not.toHaveProperty('education')
  })
})