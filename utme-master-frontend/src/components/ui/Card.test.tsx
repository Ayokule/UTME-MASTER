/**
 * Card Component Tests
 * Tests for the Card UI component
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card from './Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default styles', () => {
    render(<Card>Default Card</Card>)
    const card = screen.getByText('Default Card').parentElement
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('rounded-xl')
    expect(card).toHaveClass('shadow-sm')
  })

  it('applies padding', () => {
    render(<Card className="p-6">Padded Card</Card>)
    const card = screen.getByText('Padded Card').parentElement
    expect(card).toHaveClass('p-6')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom Card</Card>)
    const card = screen.getByText('Custom Card').parentElement
    expect(card).toHaveClass('custom-class')
  })

  it('applies hover effect', () => {
    render(<Card className="hover:shadow-md">Hover Card</Card>)
    const card = screen.getByText('Hover Card').parentElement
    expect(card).toHaveClass('hover:shadow-md')
  })

  it('renders with border', () => {
    render(<Card className="border border-gray-200">Bordered Card</Card>)
    const card = screen.getByText('Bordered Card').parentElement
    expect(card).toHaveClass('border')
  })

  it('renders with gradient background', () => {
    render(<Card className="bg-gradient-to-br from-blue-50 to-blue-100">Gradient Card</Card>)
    const card = screen.getByText('Gradient Card').parentElement
    expect(card).toHaveClass('from-blue-50')
    expect(card).toHaveClass('to-blue-100')
  })
})
