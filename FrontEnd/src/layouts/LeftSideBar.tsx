import React, { useEffect, useMemo, useRef, useState } from 'react'

// assets
import { getMenuItems } from '@/constants/menu'
import { myTeamService } from '@/services/MyTeamService'
import { useDispatch, useSelector } from 'react-redux'
import SimpleBar from 'simplebar-react'
import LogoBox from '../components/LogoBox'
import { SideBarType } from '../constants'
import { changeSideBarType } from '../redux/actions'
import { AppDispatch, RootState } from '../redux/store'
import AppMenu from './Menu'

/* Sidebar content */
const SideBarContent = () => {
	const menuItems = getMenuItems()
	const hasMyTeamPermission = useMemo(() => menuItems.some((item) => item.key === 'my_team'), [menuItems])
	const [showMyTeam, setShowMyTeam] = useState(false)

	useEffect(() => {
		if (!hasMyTeamPermission) {
			setShowMyTeam(false)
			return
		}

		let cancelled = false
		myTeamService
			.getSummary()
			.then((summary) => {
				if (!cancelled) setShowMyTeam(Boolean(summary?.hasReports))
			})
			.catch(() => {
				if (!cancelled) setShowMyTeam(false)
			})

		return () => {
			cancelled = true
		}
	}, [hasMyTeamPermission])

	const visibleMenuItems = useMemo(
		() => menuItems.filter((item) => item.key !== 'my_team' || showMyTeam),
		[menuItems, showMyTeam]
	)

	return (
		<>
			<AppMenu menuItems={visibleMenuItems} />
		</>
	)
}

interface LeftSideBarProps {
	isCondensed: boolean
	isLight: boolean
	hideUserProfile: boolean
	hideLogo?: boolean
}

const LeftSideBar = ({ hideLogo }: LeftSideBarProps) => {
	const dispatch = useDispatch<AppDispatch>()

	const sideBarType = useSelector((state: RootState) => state.Layout.sideBarType)

	const menuNodeRef = useRef<HTMLDivElement>(null)

	const handleHoverMenu = () => {
		if (sideBarType === 'hover') {
			dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_HOVERACTIVE)as any)
		} else if (sideBarType === 'hover-active') {
			dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_HOVER)as any)
		}
	}

	return (
		<React.Fragment>
			<div className="app-menu" ref={menuNodeRef}>
				{!hideLogo && <LogoBox />}

				<button id="button-hover-toggle" className="absolute top-5 end-2 rounded-full p-1.5 z-50" onClick={handleHoverMenu}>
					<span className="sr-only">Menu Toggle Button</span>
					<i className="ri-checkbox-blank-circle-line text-xl"></i>
				</button>

				<SimpleBar className="scrollbar">
					<SideBarContent />
				</SimpleBar>
			</div>
		</React.Fragment>
	)
}

export default LeftSideBar
