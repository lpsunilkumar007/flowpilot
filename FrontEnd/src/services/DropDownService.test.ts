import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DropDownService } from './DropDownService'
import { dataControllersClient } from '@/helpers/api/apiClients'
import { NexusLookUpCodeTypes, LookUpCodeTypes } from '@/helpers/api/WebApiClient'

vi.mock('@/helpers/api/apiClients', () => ({
	dataControllersClient: {
		getNexusLookUpCodeValues: vi.fn(),
		getLookUpCodeValues: vi.fn(),
	},
}))

describe('DropDownService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getNexusLookUpCodeValues', () => {
		it('returns dropdown items when API succeeds', async () => {
			const mockItems = [{ text: 'Item1', value: 1 }, { text: 'Item2', value: 2 }]
			vi.mocked(dataControllersClient.getNexusLookUpCodeValues).mockResolvedValue(mockItems as never)

			const result = await DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone)

			expect(dataControllersClient.getNexusLookUpCodeValues).toHaveBeenCalledWith(NexusLookUpCodeTypes.UserTimeZone)
			expect(result).toEqual(mockItems)
		})

		it('returns empty array when API throws', async () => {
			vi.mocked(dataControllersClient.getNexusLookUpCodeValues).mockRejectedValue(new Error('API Error'))

			const result = await DropDownService.getNexusLookUpCodeValues(NexusLookUpCodeTypes.UserTimeZone)

			expect(result).toEqual([])
		})
	})

	describe('getLookUpCodeValues', () => {
		it('returns dropdown items when API succeeds', async () => {
			const mockItems = [{ text: 'Item1', value: 1 }]
			vi.mocked(dataControllersClient.getLookUpCodeValues).mockResolvedValue(mockItems as never)

			const result = await DropDownService.getLookUpCodeValues(LookUpCodeTypes.Temp)

			expect(dataControllersClient.getLookUpCodeValues).toHaveBeenCalledWith(LookUpCodeTypes.Temp)
			expect(result).toEqual(mockItems)
		})

		it('returns empty array when API throws', async () => {
			vi.mocked(dataControllersClient.getLookUpCodeValues).mockRejectedValue(new Error('API Error'))

			const result = await DropDownService.getLookUpCodeValues(LookUpCodeTypes.Temp)

			expect(result).toEqual([])
		})
	})
})
