import { myTeamClient } from '@/helpers/api/apiClients'
import type { MyTeamRelation as ApiMyTeamRelation } from '@/helpers/api/WebApiClient'
import type {
	MyTeamMemberResponse,
	MyTeamRelation,
	MyTeamStatsResponse,
	MyTeamSummaryResponse,
} from '@/types/crm/myTeam.types'

const asUi = <T>(value: unknown) => value as T

export const myTeamService = {
	getSummary: (): Promise<MyTeamSummaryResponse> => asUi(myTeamClient.getSummary()),
	getMembers: (): Promise<MyTeamMemberResponse[]> => asUi(myTeamClient.getMembers()),
	getStats: (relation: MyTeamRelation): Promise<MyTeamStatsResponse> =>
		asUi(myTeamClient.getStats(relation as ApiMyTeamRelation)),
}
