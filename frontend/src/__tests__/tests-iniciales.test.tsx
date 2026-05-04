import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AddCandidateForm from '../components/AddCandidateForm'
import FileUploader from '../components/FileUploader'
import RecruiterDashboard from '../components/RecruiterDashboard'

// Mock fetch globally
global.fetch = jest.fn()

beforeEach(() => {
  ;(global.fetch as jest.Mock).mockReset()
})

// ==================== ADD CANDIDATE FORM TESTS ====================

describe('AddCandidateForm', () => {
  test('renders all form fields', () => {
    render(<AddCandidateForm />)
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument()
  })

  test('submits form with correct data on valid input', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => ({}),
    })

    render(<AddCandidateForm />)

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'juan@test.com' } })

    fireEvent.click(screen.getByText(/Enviar/i))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/candidates',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })

  test('shows success alert on 201 response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 201,
      json: async () => ({}),
    })

    render(<AddCandidateForm />)

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'juan@test.com' } })

    fireEvent.click(screen.getByText(/Enviar/i))

    await waitFor(() => {
      expect(screen.getByText(/Candidato añadido con éxito/i)).toBeInTheDocument()
    })
  })

  test('shows error alert on 400 response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      json: async () => ({ message: 'Invalid data' }),
    })

    render(<AddCandidateForm />)

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText(/Correo/i), { target: { value: 'invalid' } })

    fireEvent.click(screen.getByText(/Enviar/i))

    await waitFor(() => {
      expect(screen.getByText(/Error al añadir candidato/i)).toBeInTheDocument()
    })
  })

  test('adds education section when button clicked', () => {
    render(<AddCandidateForm />)

    const addEducationBtn = screen.getByText(/Añadir Educación/i)
    fireEvent.click(addEducationBtn)

    expect(screen.getByPlaceholderText(/Institución/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Título/i)).toBeInTheDocument()
  })

  test('removes education section when remove button clicked', () => {
    render(<AddCandidateForm />)

    const addEducationBtn = screen.getByText(/Añadir Educación/i)
    fireEvent.click(addEducationBtn)

    const removeBtn = screen.getByText(/Eliminar/)
    fireEvent.click(removeBtn)

    expect(screen.queryByPlaceholderText(/Institución/i)).not.toBeInTheDocument()
  })

  test('adds work experience section when button clicked', () => {
    render(<AddCandidateForm />)

    const addExpBtn = screen.getByText(/Añadir Experiencia Laboral/i)
    fireEvent.click(addExpBtn)

    expect(screen.getByPlaceholderText(/Empresa/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Puesto/i)).toBeInTheDocument()
  })

  test('removes work experience section when remove button clicked', () => {
    render(<AddCandidateForm />)

    const addExpBtn = screen.getByText(/Añadir Experiencia Laboral/i)
    fireEvent.click(addExpBtn)

    const removeBtn = screen.getByText(/Eliminar/)
    fireEvent.click(removeBtn)

    expect(screen.queryByPlaceholderText(/Empresa/i)).not.toBeInTheDocument()
  })
})

// ==================== FILE UPLOADER TESTS ====================

describe('FileUploader', () => {
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

// ==================== RECRUITER DASHBOARD TESTS ====================

describe('RecruiterDashboard', () => {
  test('renders dashboard with title', () => {
    render(
      <MemoryRouter>
        <RecruiterDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText(/Dashboard del Reclutador/i)).toBeInTheDocument()
  })

  test('renders Añadir Candidato link', () => {
    render(
      <MemoryRouter>
        <RecruiterDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText(/Añadir Nuevo Candidato/i)).toBeInTheDocument()
  })
})