import { FormInput, Label } from '@/components'
import { ModalLayout } from '@/components/HeadlessUI'
import { PageFilter, PageFilterActions, PageFilterFields } from '@/components/PageFilter'
import { MenuLinks } from '@/constants/menu'
import { PagingVariables } from '@/constants/paging'
import { PermissionTypes } from '@/constants/permissions'
import type { UserDropDownItemResponse, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { messageHelper } from '@/helpers/message.helper'
import { usePermission } from '@/hooks/usePermission'
import {
    computeBucketFromWhen,
    formatPriorityLabel,
    formatTaskTypeLabel,
    getTaskCalendarColor,
    getTaskTypeIcon,
    toTaskPriority,
    toTaskType,
} from '@/pages/orbit/manage-tasks/helpers/taskDisplay.helper'
import { RootState } from '@/redux/store'
import { DropDownService } from '@/services/DropDownService'
import { leadService } from '@/services/LeadService'
import { taskService } from '@/services/TaskService'
import { LeadFilterType, type ViewLeadListResponse } from '@/types/crm/lead.types'
import type { ViewTaskResponse } from '@/types/crm/task.types'
import { DatesSetArg, EventDropArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { formatLeadStatus, isClosedLeadStatus, leadCardClass } from '../helpers/leadDisplay.helper'
import ViewLeadBasicInfo from './shared/ViewLeadBasicInfo'

type CalendarEvent = {
    id: string
    title: string
    start: string
    backgroundColor: string
    borderColor: string
    textColor?: string
    allDay: boolean
    kind: 'lead' | 'task'
    leadId?: number
    ownerName?: string
    leadStatus?: string
    taskId?: number
    taskTitle?: string
    taskType?: string | number | null
    taskPriority?: string | number | null
    taskWhen?: string
}

const isOverdueFollowUp = (lead: ViewLeadListResponse): boolean => {
    if (!lead.nextFollowUpDate) return false
    return moment(lead.nextFollowUpDate).isBefore(moment(), 'day') && !isClosedLeadStatus(lead.leadStatusName)
}

const getFollowUpEventColor = (lead: ViewLeadListResponse): string => (isOverdueFollowUp(lead) ? '#EF4444' : '#F59E0B')

const fetchAllLeads = async (assignedToUserId?: string): Promise<ViewLeadListResponse[]> => {
    const leads: ViewLeadListResponse[] = []
    let pageNumber = 0
    let hasNextPage = true

    while (hasNextPage) {
        const res = await leadService.search({
            pageNumber,
            pageSize: PagingVariables.DefaultPageSize,
            filterType: LeadFilterType.All,
            ...(assignedToUserId ? { assignedToUserId } : {}),
        })
        leads.push(...(res.data ?? []))
        hasNextPage = res.hasNextPage
        pageNumber += 1
    }

    return leads
}

const fetchAllTasks = async (): Promise<ViewTaskResponse[]> => {
    const tasks: ViewTaskResponse[] = []
    let pageNumber = 0
    let hasNextPage = true

    while (hasNextPage) {
        const res = await taskService.search({
            pageNumber,
            pageSize: PagingVariables.DefaultPageSize,
            sortField: 'When',
            sortOrder: 'asc',
        })
        tasks.push(...(res.data ?? []))
        hasNextPage = res.hasNextPage
        pageNumber += 1
    }

    return tasks
}

const mapLeadsToEvents = (leads: ViewLeadListResponse[], range: { start: string; end: string }): CalendarEvent[] => {
    const rangeStart = moment(range.start).startOf('day')
    const rangeEnd = moment(range.end).endOf('day')

    return leads
        .filter((lead) => {
            if (!lead.nextFollowUpDate) return false
            const followUpDate = moment(lead.nextFollowUpDate)
            return followUpDate.isSameOrAfter(rangeStart) && followUpDate.isSameOrBefore(rangeEnd)
        })
        .map((lead) => {
            const backgroundColor = getFollowUpEventColor(lead)
            return {
                id: `followup-lead-${lead.id}`,
                title: lead.businessName,
                start: moment(lead.nextFollowUpDate).format('YYYY-MM-DD'),
                backgroundColor,
                borderColor: backgroundColor,
                textColor: '#ffffff',
                allDay: true,
                kind: 'lead' as const,
                leadId: lead.id,
                ownerName: lead.ownerName,
                leadStatus: formatLeadStatus(lead.leadStatusName),
            }
        })
}

const mapTasksToEvents = (tasks: ViewTaskResponse[], range: { start: string; end: string }): CalendarEvent[] => {
    const rangeStart = moment(range.start).startOf('day')
    const rangeEnd = moment(range.end).endOf('day')

    return tasks
        .filter((task) => {
            if (!task.when) return false
            const when = moment(task.when)
            return when.isSameOrAfter(rangeStart) && when.isSameOrBefore(rangeEnd)
        })
        .map((task) => {
            const backgroundColor = getTaskCalendarColor(task.when)
            const whenMoment = moment(task.when)
            return {
                id: `task-${task.id}`,
                title: task.title,
                // allDay so month view shows a solid color bar (timed events only show a tiny dot)
                start: whenMoment.format('YYYY-MM-DD'),
                backgroundColor,
                borderColor: backgroundColor,
                textColor: '#ffffff',
                allDay: true,
                kind: 'task' as const,
                taskId: task.id,
                taskTitle: task.title,
                taskType: task.type,
                taskPriority: task.priority,
                taskWhen: whenMoment.toISOString(),
            }
        })
}

const ViewLeadFollowUpCalendar = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userHasPermission } = usePermission()
    const canFilterByAssignee = userHasPermission(PermissionTypes.Permissions_Users_View)
    const canUpdateLeads = userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_Update)
    const canViewTasks = userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_View) || userHasPermission(PermissionTypes.Permissions_ManageTasks_View)
    const canUpdateTasks = userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_Update) || userHasPermission(PermissionTypes.Permissions_ManageTasks_Update)
    const canViewLeadDetail = userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_ViewDetail)
    const canViewLeadInfo = userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_ViewInfo)
    const canOpenTasksFromCalendar = userHasPermission(PermissionTypes.Permissions_ManageLeadCalendar_ViewTasks)
    const canDrag = canUpdateLeads || canUpdateTasks
    const userData = useSelector((state: RootState) => state.Auth.userData) as ViewUserDetailsResponse | undefined
    const currentUserId = userData?.id

    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [users, setUsers] = useState<UserDropDownItemResponse[]>([])
    const [assignedToUserId, setAssignedToUserId] = useState<string | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [basicInfoLeadId, setBasicInfoLeadId] = useState<number | undefined>()
    const [visibleDateRange, setVisibleDateRange] = useState({
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().endOf('month').format('YYYY-MM-DD'),
    })

    const usersForDisplay = useMemo(() => {
        if (canFilterByAssignee) return users
        if (!currentUserId) return []
        const name = `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim() || userData?.email || currentUserId
        return [{ strValue: currentUserId, text: name }]
    }, [canFilterByAssignee, users, currentUserId, userData?.firstName, userData?.lastName, userData?.email])

    useEffect(() => {
        if (!canFilterByAssignee) return
        DropDownService.getSystemUsers(false)
            .then((list) => setUsers(list ?? []))
            .catch(() => setUsers([]))
    }, [canFilterByAssignee])

    const loadCalendarEvents = useCallback(
        async (dateRange?: { start: string; end: string }) => {
            const rangeToUse = dateRange ?? visibleDateRange
            const assigneeFilter = canFilterByAssignee ? assignedToUserId : undefined

            await runWithToast(
                async () => {
                    const leadsPromise = fetchAllLeads(assigneeFilter)
                    const tasksPromise = canViewTasks ? fetchAllTasks() : Promise.resolve([] as ViewTaskResponse[])

                    const [leads, tasks] = await Promise.all([leadsPromise, tasksPromise])
                    const formatted = [...mapLeadsToEvents(leads, rangeToUse), ...mapTasksToEvents(tasks, rangeToUse)]
                    setEvents(formatted)
                    return formatted
                },
                {
                    setLoading: setIsLoading,
                    onError: () => setEvents([]),
                }
            )
        },
        [assignedToUserId, canFilterByAssignee, canViewTasks, visibleDateRange]
    )

    useEffect(() => {
        loadCalendarEvents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignedToUserId, canFilterByAssignee, canViewTasks])

    const handleDatesSet = (dateInfo: DatesSetArg) => {
        const start = moment(dateInfo.start).format('YYYY-MM-DD')
        const end = moment(dateInfo.end).subtract(1, 'day').format('YYYY-MM-DD')
        const newDateRange = { start, end }

        setVisibleDateRange(newDateRange)
        loadCalendarEvents(newDateRange)
    }

    const handleViewLead = (leadId: number, event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        navigate(MenuLinks.EditLead.replace(':id', String(leadId)))
    }

    const handleViewBasicInfo = (leadId: number, event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setBasicInfoLeadId(leadId)
    }

    const handleViewTasks = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        navigate(MenuLinks.ManageTasks)
    }

    const handleReset = () => {
        setAssignedToUserId(undefined)
    }

    const handleEventDrop = async (info: EventDropArg) => {
        const kind = info.event.extendedProps.kind as 'lead' | 'task' | undefined
        const newStart = info.event.start

        if (!newStart || !kind) {
            info.revert()
            return
        }

        if (kind === 'lead') {
            if (!canUpdateLeads) {
                info.revert()
                return
            }

            const leadId = info.event.extendedProps.leadId as number | undefined
            if (!leadId) {
                info.revert()
                return
            }

            const nextFollowUpDate = moment(newStart).startOf('day').toISOString()
            const result = await runWithToast(() => leadService.updateFollowUpDate(leadId, { nextFollowUpDate }), {
                onSuccess: (response) => {
                    messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Leads.Calendar_FollowUpRescheduled', 'Follow-up rescheduled'))
                    setEvents((prev) =>
                        prev.map((event) => {
                            if (event.kind !== 'lead' || event.leadId !== leadId) return event

                            const status = event.leadStatus
                            const isOverdue = moment(nextFollowUpDate).isBefore(moment(), 'day') && status !== 'Won' && status !== 'Lost'
                            const backgroundColor = isOverdue ? '#EF4444' : '#F59E0B'
                            return { ...event, start: nextFollowUpDate, backgroundColor, borderColor: backgroundColor }
                        })
                    )
                },
            })

            if (!result.ok) info.revert()
            return
        }

        if (!canUpdateTasks) {
            info.revert()
            return
        }

        const taskId = info.event.extendedProps.taskId as number | undefined
        const taskTitle = (info.event.extendedProps.taskTitle as string | undefined) ?? info.event.title
        const taskType = info.event.extendedProps.taskType as string | number | null | undefined
        const taskPriority = info.event.extendedProps.taskPriority as string | number | null | undefined
        const previousWhen = (info.event.extendedProps.taskWhen as string | undefined) ?? info.oldEvent.start?.toISOString()

        if (!taskId || !taskTitle) {
            info.revert()
            return
        }

        // Keep original time-of-day when dropping as an all-day event on the calendar.
        const whenMoment = moment(newStart).startOf('day')
        if (previousWhen) {
            const original = moment(previousWhen)
            whenMoment.hour(original.hour()).minute(original.minute()).second(0).millisecond(0)
        }

        const when = whenMoment.toISOString()
        const bucket = computeBucketFromWhen(whenMoment)
        const result = await runWithToast(
            () =>
                taskService.update(taskId, {
                    id: taskId,
                    title: taskTitle,
                    when,
                    bucket,
                    type: toTaskType(taskType),
                    priority: toTaskPriority(taskPriority),
                }),
            {
                onSuccess: (response) => {
                    messageHelper.showSuccess(typeof response === 'string' && response.trim() ? response : t('Manage.Tasks.Calendar_Rescheduled', 'Task rescheduled'))

                    const backgroundColor = getTaskCalendarColor(when)
                    info.event.setProp('backgroundColor', backgroundColor)
                    info.event.setProp('borderColor', backgroundColor)
                    info.event.setProp('textColor', '#ffffff')
                    info.event.setExtendedProp('taskWhen', when)

                    setEvents((prev) =>
                        prev.map((event) => {
                            if (event.kind !== 'task' || event.taskId !== taskId) return event
                            return {
                                ...event,
                                start: whenMoment.format('YYYY-MM-DD'),
                                backgroundColor,
                                borderColor: backgroundColor,
                                textColor: '#ffffff',
                                allDay: true,
                                taskWhen: when,
                            }
                        })
                    )
                },
            }
        )

        if (!result.ok) info.revert()
    }

    return (
        <div className="space-y-6">
            {canFilterByAssignee && (
                <PageFilter>
                    <PageFilterFields className="grid lg:grid-cols-1 gap-6">
                        <div>
                            <Label variant="search">{t('Manage.Leads.Filter_AssignedTo', 'Assigned to')}</Label>
                            <FormInput label="" name="assignedToUserId" type="bottom-sheet" className="form-select" value={assignedToUserId ?? ''} onChange={(e) => setAssignedToUserId(e.target.value || undefined)}>
                                <option value="">{t('Common.All', 'All')}</option>
                                {users.map((u) => (
                                    <option key={u.strValue} value={u.strValue}>
                                        {u.text}
                                    </option>
                                ))}
                            </FormInput>
                        </div>
                    </PageFilterFields>
                    <PageFilterActions>
                        <button onClick={() => loadCalendarEvents()} className="btn btn-primary" disabled={isLoading}>
                            {t('Manage.Leads.Calendar_Search', 'Search')}
                        </button>
                        <button onClick={handleReset} className="btn btn-secondary">
                            {t('Manage.Leads.Calendar_Reset', 'Reset')}
                        </button>
                    </PageFilterActions>
                </PageFilter>
            )}

            <div className={`${leadCardClass} p-4`}>
                <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        {t('Manage.Leads.Calendar_Legend_Upcoming', 'Lead follow-up')}
                    </span>
                    {canViewTasks && (
                        <span className="inline-flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-blue-600" />
                            {t('Manage.Leads.Calendar_Legend_Task', 'Task')}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        {t('Manage.Leads.Calendar_Legend_Overdue', 'Overdue')}
                    </span>
                </div>

                <div id="lead-followup-calendar">
                    <FullCalendar
                        initialView="dayGridMonth"
                        initialDate={moment().toDate()}
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
                        }}
                        events={events}
                        editable={canDrag}
                        eventStartEditable={canDrag}
                        eventDurationEditable={false}
                        eventDrop={handleEventDrop}
                        datesSet={handleDatesSet}
                        eventContent={(eventInfo) => {
                            const kind = eventInfo.event.extendedProps.kind as 'lead' | 'task'
                            const isList = eventInfo.view.type.startsWith('list')

                            if (kind === 'task') {
                                const taskType = eventInfo.event.extendedProps.taskType as string | number | null | undefined
                                const taskPriority = eventInfo.event.extendedProps.taskPriority as string | number | null | undefined
                                const taskWhen = eventInfo.event.extendedProps.taskWhen as string | undefined
                                const timeLabel = taskWhen ? moment(taskWhen).format('h:mm A') : ''

                                return (
                                    <div className={`calendar-event--task group w-full p-1 ${isList ? '' : 'text-center text-white'}`}>
                                        <div className={`flex items-center gap-1 truncate text-sm font-semibold ${isList ? 'text-gray-900 dark:text-gray-100' : 'justify-center'}`}>
                                            <i className={`${getTaskTypeIcon(taskType)} shrink-0 text-xs`} />
                                            <span className="truncate">{eventInfo.event.title}</span>
                                        </div>
                                        <div className={`truncate text-xs ${isList ? 'text-left text-gray-600 dark:text-gray-400' : 'text-center opacity-90'}`}>
                                            {timeLabel}
                                            {timeLabel ? ' · ' : ''}
                                            {formatTaskTypeLabel(taskType)}
                                            {` · ${formatPriorityLabel(taskPriority)}`}
                                        </div>
                                        <div className="mt-1 hidden items-center justify-center gap-1 group-hover:flex">
                                            {canOpenTasksFromCalendar && (
                                                <button type="button" className="inline-flex h-6 w-6 items-center justify-center gap-1 rounded bg-white/95 text-gray-800 shadow-sm ring-1 ring-black/10 hover:bg-white md:w-auto md:px-1.5" title={t('Manage.Tasks_Heading', 'Tasks')} aria-label={t('Manage.Tasks_Heading', 'Tasks')} onClick={handleViewTasks}>
                                                    <i className="ri-task-line text-xs" />
                                                    <span className="hidden text-[10px] font-medium md:inline">{t('Manage.Tasks_Heading', 'Tasks')}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            }

                            const leadId = eventInfo.event.extendedProps.leadId as number
                            const ownerName = eventInfo.event.extendedProps.ownerName as string
                            const leadStatus = eventInfo.event.extendedProps.leadStatus as string

                            return (
                                <div className={`group p-1 ${isList ? 'w-full' : ''}`}>
                                    <div className={`truncate text-sm font-semibold ${isList ? 'text-gray-900 dark:text-gray-100' : ''}`}>{eventInfo.event.title}</div>
                                    <div className={`truncate text-xs ${isList ? 'text-gray-600 dark:text-gray-400' : 'opacity-90'}`}>
                                        {ownerName}
                                        {leadStatus ? ` · ${leadStatus}` : ''}
                                    </div>
                                    <div className="mt-1 hidden items-center justify-center gap-1 group-hover:flex">
                                        {canViewLeadDetail && (
                                            <button type="button" className="inline-flex h-6 w-6 items-center justify-center gap-1 rounded bg-white/95 text-gray-800 shadow-sm ring-1 ring-black/10 hover:bg-white md:w-auto md:px-1.5" title={t('Manage.Leads.Calendar_Action_View', 'View')} aria-label={t('Manage.Leads.Calendar_Action_View', 'View')} onClick={(e) => handleViewLead(leadId, e)}>
                                                <i className="ri-eye-line text-xs" />
                                                <span className="hidden text-[10px] font-medium md:inline">{t('Manage.Leads.Calendar_Action_View', 'View')}</span>
                                            </button>
                                        )}
                                        {canViewLeadInfo && (
                                            <button type="button" className="inline-flex h-6 w-6 items-center justify-center gap-1 rounded bg-white/95 text-gray-800 shadow-sm ring-1 ring-black/10 hover:bg-white md:w-auto md:px-1.5" title={t('Manage.Leads.Calendar_Action_ViewBasicInfo', 'View Basic Info')} aria-label={t('Manage.Leads.Calendar_Action_ViewBasicInfo', 'View Basic Info')} onClick={(e) => handleViewBasicInfo(leadId, e)}>
                                                <i className="ri-information-line text-xs" />
                                                <span className="hidden text-[10px] font-medium md:inline">{t('Manage.Leads.Calendar_Action_ViewBasicInfo', 'Info')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
            </div>

            <ModalLayout isStatic={true} showModal={basicInfoLeadId !== undefined} toggleModal={() => setBasicInfoLeadId(undefined)} panelClassName="!min-h-0 !overflow-hidden w-[min(640px,95vw)] h-auto max-h-none p-0 m-0 shadow-xl" placement="justify-center items-center p-4">
                {basicInfoLeadId !== undefined && <ViewLeadBasicInfo leadId={basicInfoLeadId} users={usersForDisplay} onClose={() => setBasicInfoLeadId(undefined)} />}
            </ModalLayout>
        </div>
    )
}

export default ViewLeadFollowUpCalendar
