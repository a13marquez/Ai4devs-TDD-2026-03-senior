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
  // Bug #3: This test will show the gap — 2025-02-30 passes regex but is invalid
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

describe('validateCandidateData', () => {
  describe('create path (no id)', () => {
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

  describe('update path (with id) — Bug #1', () => {
    // FAILING TEST — Bug #1: currently validateCandidateData returns early when id is present
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
})
