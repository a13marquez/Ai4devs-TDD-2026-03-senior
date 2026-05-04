import { describe, expect, test } from '@jest/globals'
import request from 'supertest'
import { app } from '../index'
import fs from 'fs'
import path from 'path'
import os from 'os'

const tmpDir = path.join(os.tmpdir(), 'ats-test-uploads')

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