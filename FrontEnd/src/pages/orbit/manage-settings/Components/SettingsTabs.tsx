import { EmptyState, TabsWrapper } from '@/components'

interface TabContent {
	title: string
	content: React.JSX.Element | null
}

interface SettingsTabsProps {
	tabContent: TabContent[]
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ tabContent }) => {
	return (
		<TabsWrapper
			tabListClassName="permission-tabs"
			variant="card"
			tabPanelsClassName="border border-t-transparent dark:border-gray-600"
			tabs={tabContent.map((tab, idx) => ({
				key: idx,
				title: tab.title,
				content: tab.content ?? <EmptyState title="No content available" />,
			}))}
		/>
	)
}

export default SettingsTabs
