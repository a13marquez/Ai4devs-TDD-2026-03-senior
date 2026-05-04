import { beforeEach, describe, expect, test } from '@jest/globals'
import { prisma, mockReset } from '../jest.setup'
import { Candidate } from '../domain/models/Candidate'

beforeEach(() => {
  mockReset(prisma)
})

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
      education: [
        { institution: 'MIT', title: 'CS', startDate: new Date('2020-01-01') },
      ],
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
      workExperience: [
        { company: 'Acme', position: 'Dev', startDate: new Date('2020-01-01') },
      ],
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