import { FormInput, VerticalForm } from '@/components'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { formatHelper } from '@/helpers/format.helper'
import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import { leadService } from '@/services/LeadService'
import { EntityNoteType, type CreateEntityNoteRequest, type ViewEntityNoteResponse } from '@/types/crm/lead.types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { leadCardClass } from '../helpers/leadDisplay.helper'
import LeadSectionCard from './shared/LeadSectionCard'

interface ViewLeadNotesProps {
	id: string
}

const ViewLeadNotes: React.FC<ViewLeadNotesProps> = ({ id }) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(true)
	const [notes, setNotes] = useState<ViewEntityNoteResponse[]>([])

	const load = async () => {
		setLoading(true)
		try {
			const res = await leadService.getNotes(Number(id))
			setNotes(res)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [id])

	const onSubmit = async (formInfo: CreateEntityNoteRequest) => {
		await runWithToast(
			() =>
				leadService.createNote(Number(id), {
					...formInfo,
					entityNoteType: EntityNoteType.Lead,
				}),
			{
				onSuccess: () => {
					messageHelper.showSuccess(t('Manage.Leads.NoteAdded', 'Note added'))
					load()
				},
			}
		)
	}

	if (loading) return <AnimationSkeleton />

	return (
		<div className="space-y-6 p-4">
			<LeadSectionCard title={t('Manage.Leads.AddNote', 'Add note')} subtitle={t('Manage.Leads.AddNote_Sub', 'Capture context for your team')} icon="ri-quill-pen-line">
				<VerticalForm<CreateEntityNoteRequest> onSubmit={onSubmit} defaultValues={{ entityNoteType: EntityNoteType.Lead, noteText: '' }}>
					<FormInput label={t('Manage.Leads.NoteText', 'Note')} required name="noteText" type="textarea" className="form-input" />
					<div className="mt-4 flex justify-end">
						<button type="submit" className="btn btn-primary">
							{t('Manage.Leads.SaveNote', 'Save note')}
						</button>
					</div>
				</VerticalForm>
			</LeadSectionCard>

			<LeadSectionCard title={t('Manage.Leads.NotesList', 'Notes')} subtitle={`${notes.length} ${notes.length === 1 ? 'entry' : 'entries'}`} icon="ri-sticky-note-line">
				{notes.length === 0 ? (
					<div className="py-8 text-center text-gray-500">
						<i className="ri-sticky-note-line text-3xl" />
						<p className="mt-2">{t('Manage.Leads.NoNotes', 'No notes yet.')}</p>
					</div>
				) : (
					<div className="grid gap-3 md:grid-cols-2">
						{notes.map((n) => (
							<div key={n.id} className={`${leadCardClass} p-4`}>
								<p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{n.noteText}</p>
								<p className="mt-3 text-xs text-gray-500">{formatHelper.MomentDateFormat(n.createdOn)}</p>
							</div>
						))}
					</div>
				)}
			</LeadSectionCard>
		</div>
	)
}

export default ViewLeadNotes
