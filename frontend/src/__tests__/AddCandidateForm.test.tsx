import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddCandidateForm from '../components/AddCandidateForm'

// Mock fetch globally
global.fetch = jest.fn()

describe('AddCandidateForm', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
  })

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