import { describe, it, expect } from 'vitest'
import { render} from '@testing-library/react'
import ViewUsers from './ViewUsers'

describe('ViewUsers', () => {
	it('renders loading skeleton when loading', () => {
		render(<ViewUsers onActionClick={() => {}} rowData={[]} loading={true} />)
		expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
	})

	it('renders grid when not loading', () => {
		render(<ViewUsers onActionClick={() => {}} rowData={[]} loading={false} />)
		expect(document.querySelector('.ag-theme-quartz')).toBeInTheDocument()
	})

	it('renders user data in grid when provided', () => {
		const rowData = [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', isActive: true, emailConfirmed: true } as never]
		render(<ViewUsers onActionClick={() => {}} rowData={rowData} loading={false} />)
		expect(document.querySelector('.ag-theme-quartz')).toBeInTheDocument()
	})
})
