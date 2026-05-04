import { beforeEach, describe, expect, test } from '@jest/globals'
import { prisma, mockReset } from '../jest.setup'
import { Candidate } from '../domain/models/Candidate'
import {
  validateCandidateData,
  validateName,
  validateEmail,
  validatePhone,
  validateAddress,
  validateDate,
  validateEducation,
  validateExperience,
  validateCV,
} from '../application/validator'
import request from 'supertest'
import { app } from '../index'
import fs from 'fs'
import path from 'path'
import os from 'os'

beforeEach(() => {
  mockReset(prisma)
})

const tmpDir = path.join(os.tmpdir(), 'ats-test-uploads')

// ==================== VALIDATOR TESTS ====================

describe('validateName', () => {
  test('valid name should not throw', () => {
    expect(() => validateName('Juan')).not.toThrow()
  })
  test('too short name should throw', () => {
    expect(() => validateName('J')).toThrow('Invalid name')
  })
  test('too long name should throw', () => {
    expect(() => validateName('A'.repeat(101))).toThrow('Invalid name')
  })
  test('invalid characters should throw', () => {
    expect(() => validateName('Juan123')).toThrow('Invalid name')
  })
})

describe('validateEmail', () => {
  test('valid email should not throw', () => {
    expect(() => validateEmail('test@example.com')).not.toThrow()
  })
  test('invalid email should throw', () => {
    expect(() => validateEmail('invalid')).toThrow('Invalid email')
  })
})

describe('validatePhone', () => {
  test('valid phone starting with 6 should not throw', () => {
    expect(() => validatePhone('612345678')).not.toThrow()
  })
  test('valid phone starting with 7 should not throw', () => {
    expect(() => validatePhone('712345678')).not.toThrow()
  })
  test('valid phone starting with 9 should not throw', () => {
    expect(() => validatePhone('912345678')).not.toThrow()
  })
  test('invalid phone should throw', () => {
    expect(() => validatePhone('123456789')).toThrow('Invalid phone')
  })
  test('empty phone should not throw', () => {
    expect(() => validatePhone('')).not.toThrow()
  })
})

describe('validateAddress', () => {
  test('valid address should not throw', () => {
    expect(() => validateAddress('Calle Mayor 1')).not.toThrow()
  })
  test('too long address should throw', () => {
    expect(() => validateAddress('A'.repeat(101))).toThrow('Invalid address')
  })
})

describe('validateDate', () => {
  test('valid date should not throw', () => {
    expect(() => validateDate('2025-01-15')).not.toThrow()
  })
  test('invalid format should throw', () => {
    expect(() => validateDate('15/01/2025')).toThrow('Invalid date')
  })
  test('invalid calendar date should throw', () => {
    expect(() => validateDate('2025-02-30')).toThrow('Invalid date')
  })
})

describe('validateEducation', () => {
  test('valid education should not throw', () => {
    expect(() =>
      validateEducation({
        institution: 'MIT',
        title: 'CS Degree',
        startDate: '2020-09-01',
      })
    ).not.toThrow()
  })
  test('missing institution should throw', () => {
    expect(() =>
      validateEducation({ title: 'CS Degree', startDate: '2020-09-01' })
    ).toThrow('Invalid institution')
  })
})

describe('validateExperience', () => {
  test('valid experience should not throw', () => {
    expect(() =>
      validateExperience({
        company: 'Acme',
        position: 'Engineer',
        startDate: '2020-01-01',
      })
    ).not.toThrow()
  })
})

describe('validateCV', () => {
  test('valid CV should not throw', () => {
    expect(() =>
      validateCV({ filePath: '/path/to/file.pdf', fileType: 'application/pdf' })
    ).not.toThrow()
  })
  test('missing filePath should throw', () => {
    expect(() =>
      validateCV({ fileType: 'application/pdf' })
    ).toThrow('Invalid CV data')
  })
})

describe('validateCandidateData - create path', () => {
  test('valid data should not throw', () => {
    expect(() =>
      validateCandidateData({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        phone: '612345678',
        address: 'Calle Mayor 1',
      })
    ).not.toThrow()
  })
  test('missing required fields should throw', () => {
    expect(() => validateCandidateData({})).toThrow()
  })
})

describe('validateCandidateData - update path (Bug #1)', () => {
  test('with id and invalid email should throw', () => {
    expect(() =>
      validateCandidateData({
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'invalid-email',
      })
    ).toThrow('Invalid email')
  })
  test('with id and invalid name should throw', () => {
    expect(() =>
      validateCandidateData({
        id: 1,
        firstName: 'J',
        lastName: 'Pérez',
        email: 'juan@example.com',
      })
    ).toThrow('Invalid name')
  })
  test('with id and valid partial data should not throw', () => {
    expect(() =>
      validateCandidateData({
        id: 1,
        firstName: 'Juan',
      })
    ).not.toThrow()
  })
})

// ==================== CANDIDATE MODEL TESTS ====================

describe('Candidate Model', () => {
  test('constructor sets all fields', () => {
    const data = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '612345678',
      address: 'Calle Mayor 1',
      education: [],
      workExperience: [],
      resumes: [],
    }
    const c = new Candidate(data)
    expect(c.id).toBe(1)
    expect(c.firstName).toBe('Juan')
    expect(c.email).toBe('juan@example.com')
  })

  test('save() creates candidate when no id', async () => {
    const c = new Candidate({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    })
    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: null,
      address: null,
    })
    const result = await c.save()
    expect(prisma.candidate.create).toHaveBeenCalledWith({
      data: {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
      },
    })
    expect(result.id).toBe(1)
  })

  test('save() updates candidate when id exists', async () => {
    const c = new Candidate({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
    })
    prisma.candidate.update.mockResolvedValue({} as any)
    await c.save()
    expect(prisma.candidate.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.anything(),
    })
  })

  test('save() includes educations in create data', async () => {
    const c = new Candidate({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      education: [{ institution: 'MIT', title: 'CS', startDate: new Date('2020-01-01') }],
    })
    prisma.candidate.create.mockResolvedValue({} as any)
    await c.save()
    const calledWith = prisma.candidate.create.mock.calls[0][0] as any
    expect(calledWith.data.educations).toBeDefined()
    expect(calledWith.data.educations.create[0].institution).toBe('MIT')
  })

  test('save() includes workExperiences in create data', async () => {
    const c = new Candidate({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      workExperience: [{ company: 'Acme', position: 'Dev', startDate: new Date('2020-01-01') }],
    })
    prisma.candidate.create.mockResolvedValue({} as any)
    await c.save()
    const calledWith = prisma.candidate.create.mock.calls[0][0] as any
    expect(calledWith.data.workExperiences).toBeDefined()
  })

  test('save() includes resumes in create data', async () => {
    const c = new Candidate({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      resumes: [{ filePath: '/path/to/cv.pdf', fileType: 'application/pdf' }],
    })
    prisma.candidate.create.mockResolvedValue({} as any)
    await c.save()
    const calledWith = prisma.candidate.create.mock.calls[0][0] as any
    expect(calledWith.data.resumes).toBeDefined()
  })

  test('findOne returns Candidate instance when found', async () => {
    prisma.candidate.findUnique.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: null,
      address: null,
    })
    const result = await Candidate.findOne(1)
    expect(result).toBeInstanceOf(Candidate)
    expect(result?.id).toBe(1)
  })

  test('findOne returns null when not found', async () => {
    prisma.candidate.findUnique.mockResolvedValue(null)
    const result = await Candidate.findOne(999)
    expect(result).toBeNull()
  })

  test('save() throws on PrismaClientInitializationError', async () => {
    const c = new Candidate({ firstName: 'Juan', lastName: 'Pérez', email: 'j@j.com' })
    prisma.candidate.create.mockImplementation(() => {
      throw new Error('No se pudo conectar con la base de datos')
    })
    await expect(c.save()).rejects.toThrow('No se pudo conectar con la base de datos')
  })
})

describe('Education Model', () => {
  test('constructor sets fields', () => {
    const { Education } = require('../domain/models/Education')
    const edu = new Education({
      institution: 'MIT',
      title: 'CS',
      startDate: '2020-01-01',
    })
    expect(edu.institution).toBe('MIT')
    expect(edu.title).toBe('CS')
  })

  test('save() creates education', async () => {
    const { Education } = require('../domain/models/Education')
    const edu = new Education({
      institution: 'MIT',
      title: 'CS',
      startDate: '2020-01-01',
    })
    prisma.education.create.mockResolvedValue({ id: 1 } as any)
    const result = await edu.save()
    expect(prisma.education.create).toHaveBeenCalled()
    expect(result.id).toBe(1)
  })
})

describe('WorkExperience Model', () => {
  test('constructor sets fields', () => {
    const { WorkExperience } = require('../domain/models/WorkExperience')
    const exp = new WorkExperience({
      company: 'Acme',
      position: 'Dev',
      startDate: '2020-01-01',
    })
    expect(exp.company).toBe('Acme')
    expect(exp.position).toBe('Dev')
  })

  test('save() creates work experience', async () => {
    const { WorkExperience } = require('../domain/models/WorkExperience')
    const exp = new WorkExperience({
      company: 'Acme',
      position: 'Dev',
      startDate: '2020-01-01',
    })
    prisma.workExperience.create.mockResolvedValue({ id: 1 } as any)
    const result = await exp.save()
    expect(prisma.workExperience.create).toHaveBeenCalled()
  })
})

describe('Resume Model', () => {
  test('constructor sets fields', () => {
    const { Resume } = require('../domain/models/Resume')
    const resume = new Resume({
      filePath: '/path/to/cv.pdf',
      fileType: 'application/pdf',
      candidateId: 1,
    })
    expect(resume.filePath).toBe('/path/to/cv.pdf')
    expect(resume.fileType).toBe('application/pdf')
    expect(resume.candidateId).toBe(1)
  })

  test('save() creates resume and sets uploadDate', async () => {
    const { Resume } = require('../domain/models/Resume')
    const resume = new Resume({
      filePath: '/path/to/cv.pdf',
      fileType: 'application/pdf',
      candidateId: 1,
    })
    prisma.resume.create.mockResolvedValue({
      id: 1,
      filePath: '/path/to/cv.pdf',
      fileType: 'application/pdf',
      candidateId: 1,
      uploadDate: new Date(),
    } as any)
    const result = await resume.save()
    expect(prisma.resume.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        filePath: '/path/to/cv.pdf',
        fileType: 'application/pdf',
        candidateId: 1,
      }),
    })
  })

  test('save() throws error on update attempt', async () => {
    const { Resume } = require('../domain/models/Resume')
    const resume = new Resume({
      id: 1,
      filePath: '/path/to/cv.pdf',
      fileType: 'application/pdf',
      candidateId: 1,
    })
    await expect(resume.save()).rejects.toThrow('No se permite la actualización de un currículum existente')
  })
})

// ==================== CANDIDATE SERVICE TESTS ====================

describe('addCandidate Service', () => {
  test('happy path with valid data returns saved candidate', async () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '612345678',
      address: 'Calle Mayor 1',
    }
    prisma.candidate.create.mockResolvedValue({ id: 1, ...mockCandidateData })
    prisma.education.create.mockResolvedValue({ id: 1 } as any)
    prisma.workExperience.create.mockResolvedValue({ id: 1 } as any)
    prisma.resume.create.mockResolvedValue({ id: 1 } as any)

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
      educations: [{ institution: 'MIT', title: 'CS', startDate: '2020-01-01' }],
    }
    prisma.candidate.create.mockResolvedValue({ id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' } as any)
    prisma.education.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    await addCandidate(mockCandidateData)

    expect(prisma.education.create).toHaveBeenCalled()
  })

  test('validation error throws before any Prisma call', async () => {
    const invalidData = {
      firstName: 'J',
      lastName: 'Pérez',
      email: 'invalid-email',
    }
    const { addCandidate } = require('../application/services/candidateService')
    await expect(addCandidate(invalidData)).rejects.toThrow()
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
      workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2020-01-01' }],
    }
    prisma.candidate.create.mockResolvedValue({ id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' } as any)
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
    prisma.candidate.create.mockResolvedValue({ id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' } as any)
    prisma.resume.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    await addCandidate(mockCandidateData)

    expect(prisma.resume.create).toHaveBeenCalled()
  })

  test('returns candidate without relations in response (Bug #2)', async () => {
    const mockCandidateData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      educations: [{ institution: 'MIT', title: 'CS', startDate: '2020-01-01' }],
    }
    prisma.candidate.create.mockResolvedValue({ id: 1, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' } as any)
    prisma.education.create.mockResolvedValue({ id: 1 } as any)

    const { addCandidate } = require('../application/services/candidateService')
    const result = await addCandidate(mockCandidateData)

    expect(result).not.toHaveProperty('educations')
    expect(result).not.toHaveProperty('education')
  })
})

// ==================== API ROUTE TESTS ====================

describe('POST /candidates', () => {
  test('valid data returns 201 with candidate data', async () => {
    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: null,
      address: null,
    })
    prisma.education.create.mockResolvedValue({ id: 1 } as any)
    prisma.workExperience.create.mockResolvedValue({ id: 1 } as any)
    prisma.resume.create.mockResolvedValue({ id: 1 } as any)

    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
      })

    expect(res.status).toBe(201)
    expect(res.body).toBeDefined()
    expect(res.body.id).toBe(1)
  })

  test('invalid data returns 400 with error message', async () => {
    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'J',
        lastName: 'Pérez',
        email: 'invalid-email',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toBeDefined()
    expect(res.body.message).toContain('Invalid')
  })

  test('missing required fields returns 400', async () => {
    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Juan',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toBeDefined()
  })

  test('duplicate email returns 400 with email already exists message', async () => {
    const p2002Error = new Error('Unique constraint failed')
    ;(p2002Error as any).code = 'P2002'
    prisma.candidate.create.mockRejectedValue(p2002Error)

    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('email already exists')
  })

  test('with educations and workExperiences returns 201', async () => {
    prisma.candidate.create.mockResolvedValue({
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: null,
      address: null,
    })
    prisma.education.create.mockResolvedValue({ id: 1 } as any)
    prisma.workExperience.create.mockResolvedValue({ id: 1 } as any)
    prisma.resume.create.mockResolvedValue({ id: 1 } as any)

    const res = await request(app)
      .post('/candidates')
      .send({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        educations: [{ institution: 'MIT', title: 'CS', startDate: '2020-01-01' }],
        workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2020-01-01' }],
      })

    expect(res.status).toBe(201)
    expect(prisma.education.create).toHaveBeenCalled()
    expect(prisma.workExperience.create).toHaveBeenCalled()
  })
})

describe('POST /upload', () => {
  test('returns 400 for invalid file type (.txt)', async () => {
    const tmpFile = path.join(tmpDir, 'test.txt')
    fs.writeFileSync(tmpFile, 'test content')

    const res = await request(app)
      .post('/upload')
      .attach('file', tmpFile)

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Invalid file type')

    fs.unlinkSync(tmpFile)
  })

  test('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/upload')
    expect(res.status).toBe(400)
  })
})