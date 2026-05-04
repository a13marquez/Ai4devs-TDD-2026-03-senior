import { beforeEach, describe, expect, test } from '@jest/globals'
import request from 'supertest'
import { app } from '../index'
import { prisma, mockReset } from '../jest.setup'

beforeEach(() => {
  mockReset(prisma)
})

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
        firstName: 'J', // too short
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
  test('upload endpoint exists and returns 400 for invalid file type', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('test content'), { filename: 'test.txt', contentType: 'text/plain' })

    // Multer should reject non-PDF/DOCX files
    expect(res.status).toBe(400)
  })
})