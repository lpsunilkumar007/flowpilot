import type { MyTeamStatsSliceResponse } from '@/types/crm/myTeam.types'
import type { ApexOptions } from 'apexcharts'
import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { useTranslation } from 'react-i18next'

const CHART_COLORS = ['#0B8A96', '#10B981', '#EF4444', '#F59E0B', '#6c757d', '#0EA5E9', '#E6FAFC']

export type MyTeamChartKind = 'leadStatus' | 'taskProgress' | 'leadInterest'

interface MyTeamPieChartProps {
	title: string
	slices: MyTeamStatsSliceResponse[]
	chartKind: MyTeamChartKind
	selectedKey: string | null
	selectedChart: MyTeamChartKind | null
	onSliceClick: (chartKind: MyTeamChartKind, slice: MyTeamStatsSliceResponse) => void
}

const MyTeamPieChart: React.FC<MyTeamPieChartProps> = ({ title, slices, chartKind, selectedKey, selectedChart, onSliceClick }) => {
	const { t } = useTranslation()
	const isActiveChart = selectedChart === chartKind

	const series = useMemo(() => slices.map((s) => s.count), [slices])
	const labels = useMemo(() => slices.map((s) => s.label), [slices])

	const options: ApexOptions = useMemo(
		() => ({
			chart: {
				type: 'pie',
				height: 280,
				events: {
					dataPointSelection: (_event, _chartContext, config) => {
						const index = config?.dataPointIndex
						if (index == null || index < 0) return
						const slice = slices[index]
						if (slice) onSliceClick(chartKind, slice)
					},
				},
			},
			labels,
			colors: CHART_COLORS,
			legend: {
				show: true,
				position: 'bottom',
				horizontalAlign: 'center',
				fontSize: '12px',
			},
			dataLabels: {
				enabled: true,
			},
			tooltip: {
				y: {
					formatter: (val: number) => `${val} ${t('Manage.MyTeam.Chart_Members', 'members')}`,
				},
			},
			responsive: [
				{
					breakpoint: 600,
					options: {
						chart: { height: 220 },
						legend: { show: false },
					},
				},
			],
		}),
		[labels, slices, chartKind, onSliceClick, t]
	)

	return (
		<div className={`rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${isActiveChart ? 'ring-2 ring-primary/40' : ''}`}>
			<div className="mb-2 flex items-center justify-between gap-2">
				<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
				{isActiveChart && selectedKey && (
					<span className="truncate text-xs text-primary">{slices.find((s) => s.key === selectedKey)?.label}</span>
				)}
			</div>
			{slices.length === 0 ? (
				<p className="flex h-[220px] items-center justify-center text-sm text-gray-400">
					{t('Manage.MyTeam.Chart_Empty', 'No data')}
				</p>
			) : (
				<ReactApexChart className="apex-charts" options={options} series={series} type="pie" height={280} />
			)}
		</div>
	)
}

export default MyTeamPieChart
