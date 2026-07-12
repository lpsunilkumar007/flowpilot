import { Label, PopupBody, PopupFooter, PopupHeader, PopupWrapper } from '@/components'
import { ViewEmailLogDetailResponse } from '@/helpers/api/WebApiClient'
import { emailLogService } from '@/services/EmailLogService'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
interface ViewEmailLogProps {
	viewEmailLogOutput: (clsoePopup: boolean) => void
	id: number
}

const ViewEmailLogDetails: React.FC<ViewEmailLogProps> = (props) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [emailLogDetail, setEmailLogDetail] = useState<ViewEmailLogDetailResponse>()
	const loadingIndicator = () => <AnimationSkeleton />

	useEffect(() => {
		const fetchData = async () => {
			await fetchEmailLogDetails()
		}
		fetchData()
	}, [props.id])
	//fetch email log by id
	const fetchEmailLogDetails = async () => {
		try {
			const response = await emailLogService.getEmailLogById(props.id)
			setEmailLogDetail(response)
		} finally {
			setLoading(false)
		}
	}
	return (
		<>
			<PopupWrapper variant="default">
				<PopupHeader title={t('Manage.EmailLog.View_ViewDetails', 'View Details')} onClose={() => props.viewEmailLogOutput(true)} />
				{loading && loadingIndicator()}
				{!loading && emailLogDetail && (
					<>
						<PopupBody>
							<div className="grid lg:grid-cols-1 gap-6">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_DisplayName', 'Display Name')}</Label>
										<div className="readonly-field">{emailLogDetail.displayName || '-'}</div>
									</div>
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_To', 'To')}</Label>
										<div className="readonly-field">{emailLogDetail.to || '-'}</div>
									</div>
								</div>
								<div className="grid grid-cols-1 gap-4">
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_Subject', 'Subject')}</Label>
										<div className="readonly-field">{emailLogDetail.subject || '-'}</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_ReplyTo', 'Reply to')}</Label>
										<div className="readonly-field">{emailLogDetail.replyTo || '-'}</div>
									</div>
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_ReplyToName', 'Reply To Name')}</Label>
										<div className="readonly-field">{emailLogDetail.replyToName || '-'}</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_Bcc', 'Bcc')}</Label>
										<div className="readonly-field">{emailLogDetail.bcc || '-'}</div>
									</div>
									<div>
										<Label className="readonly-label">{t('Manage.EmailLog.View_Cc', 'Cc')}</Label>
										<div className="readonly-field">{emailLogDetail.cc || '-'}</div>
									</div>
								</div>

								<div className="space-y-2 min-w-0">
									<label className="text-xs font-semibold text-muted-foreground">Body</label>
									<div
										className="rounded-lg border bg-muted/40 p-4 text-sm prose dark:prose-invert max-w-none overflow-x-auto"
										dangerouslySetInnerHTML={{
											__html: emailLogDetail.body || '',
										}}
									/>
								</div>
							</div>
						</PopupBody>
						<PopupFooter>
							<button className="btn btn-secondary" onClick={() => props.viewEmailLogOutput(true)}>
								{t('Common.Close', 'Close')}
							</button>
						</PopupFooter>
					</>
				)}
			</PopupWrapper>
		</>
	)
}

export default ViewEmailLogDetails
