import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileUploader from '../components/FileUploader'

// Mock fetch globally
global.fetch = jest.fn()

describe('FileUploader', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
  })

  test('renders file input and upload button', () => {
    render(<FileUploader onChange={jest.fn()} onUpload={jest.fn()} />)
    expect(screen.getByRole('button', { name: /Subir Archivo/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/File/i)).toBeInTheDocument()
  })

  test('shows selected filename after file selection', () => {
    render(<FileUploader onChange={jest.fn()} onUpload={jest.fn()} />)

    const fileInput = screen.getByLabelText(/File/i)
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText(/Selected file: test.pdf/i)).toBeInTheDocument()
  })

  test('upload button triggers fetch call', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ filePath: '/uploads/test.pdf', fileType: 'application/pdf' }),
    })

    render(<FileUploader onChange={jest.fn()} onUpload={jest.fn()} />)

    const fileInput = screen.getByLabelText(/File/i)
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    const uploadButton = screen.getByRole('button', { name: /Subir Archivo/i })
    fireEvent.click(uploadButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/upload',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })
})