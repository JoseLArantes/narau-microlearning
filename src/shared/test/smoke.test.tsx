import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

test('toolchain renders', () => {
  render(<main>ok</main>)
  expect(screen.getByRole('main')).toHaveTextContent('ok')
})
