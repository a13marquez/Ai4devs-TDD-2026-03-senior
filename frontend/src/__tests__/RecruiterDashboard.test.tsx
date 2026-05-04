import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecruiterDashboard from '../components/RecruiterDashboard'

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