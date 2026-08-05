import React, { useEffect, useState } from 'react'

// redux
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../redux/store'
import { changeLayoutTheme, changeSideBarType, fetchUserProfileSuccess, showRightSidebar } from '../redux/actions'

// hooks
import { useViewPort } from '../hooks'

// constants
import { SideBarType, LayoutTheme } from '../constants'

// assets
import avatar2 from '@/assets/images/users/avatar-2.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'

import TopBarSearch from '../components/TopBarSearch'
import LanguageDropdown from '../components/LanguageDropdown'
import NotificationDropdown from '../components/NotificationDropDown'
import AppsDropDown from '../components/AppsDropDown'
import MaximizeScreen from '../components/MaximizeScreen'
import ProfileDropDown from '../components/ProfileDropDown'
import LogoBox from '../components/LogoBox'
import { TenantCurrentSubscriptionDetailResponse, UpdateUserRequest, ViewUserDetailsResponse } from '@/helpers/api/WebApiClient'
import { personalService } from '@/services/PersonalService'
import { MenuLinks } from '@/constants/menu'
import TimeZoneWarning from '@/components/TimeZoneWarning'
import { messageHelper } from '@/helpers/message.helper'
import { runWithToast } from '@/helpers/asyncToast.helper'
import { commonHelper } from '@/helpers/common.helper'
import { AuthActionTypes } from '@/redux/auth/constants'

import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { usePermission } from '@/hooks/usePermission'
import { PermissionTypes } from '@/constants/permissions'

export interface NotificationItem {
    id: number
    text: string
    subText: string
    icon?: string
    avatar?: string
    bgColor?: string
    createdAt: Date
}

/**
 * notification items
 */
const notifications: NotificationItem[] = [
    {
        id: 1,
        text: 'Datacorp',
        subText: 'Caleb Flakelar commented on Admin',
        icon: 'ri-message-3-line text-lg',
        bgColor: 'primary',
        createdAt: subtractHours(new Date(), 1),
    },
    {
        id: 2,
        text: 'Admin',
        subText: 'New user registered',
        icon: 'ri-user-add-line text-lg',
        bgColor: 'info',
        createdAt: subtractHours(new Date(), 60),
    },
    {
        id: 3,
        text: 'Cristina Pride',
        subText: 'Hi, How are you? What about our next meeting',
        avatar: avatar2,
        createdAt: subtractHours(new Date(), 1440),
    },
    {
        id: 4,
        text: 'Datacorp',
        subText: 'Caleb Flakelar commented on Admin',
        icon: 'ri-discuss-line text-lg',
        bgColor: 'primary',
        createdAt: subtractHours(new Date(), 2880),
    },
    {
        id: 5,
        text: 'Karen Robinson',
        subText: 'Wow ! this admin looks good and awesome design',
        avatar: avatar4,
        createdAt: subtractHours(new Date(), 2880),
    },
]

/**
 * profile menu items
 */
const profileMenus = [
    {
        label: 'My Account',
        icon: 'ri-account-circle-line',
        redirectTo: MenuLinks.ManageProfile,
    },
    // {
    // 	label: 'My Account',
    // 	icon: 'ri-account-circle-line',
    // 	redirectTo: '/pages/profile',
    // },
    // {
    // 	label: 'Settings',
    // 	icon: 'ri-settings-4-line',
    // 	redirectTo: '/pages/profile',
    // },
    // {
    // 	label: 'Support',
    // 	icon: 'ri-customer-service-2-line',
    // 	redirectTo: '/pages/faq',
    // },
    // {
    // 	label: 'Lock Screen',
    // 	icon: 'ri-lock-password-line',
    // 	redirectTo: '/auth/lock-screen',
    // },
    {
        label: 'Logout',
        icon: 'ri-logout-box-line',
        redirectTo: '/auth/logout',
    },
    // {
    // 	label: 'My Subscriptions',
    // 	icon: 'ri-calendar-check-line',
    // 	redirectTo: `${MenuLinks.MySubscriptions}`,
    // },
]

/**
 * for subtraction minutes
 */
function subtractHours(date: Date, minutes: number) {
    date.setMinutes(date.getMinutes() - minutes)
    return date
}

const Topbar = () => {
    const [showTZWarning, setShowTZWarning] = useState(false)
    const [hasCheckedTimezone, setHasCheckedTimezone] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { width } = useViewPort()
    const navigate = useNavigate()
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const normalized = commonHelper.TIMEZONE_NORMALIZATION_MAP[tz] ?? tz
    const tenantSubscriptionPlan = useSelector((state: RootState) => state.Auth.tenantSubscriptionPlan) as TenantCurrentSubscriptionDetailResponse
    const { userHasPermission } = usePermission()
    const layoutTheme = useSelector((state: RootState) => state.Layout.layoutTheme)
    const sideBarType = useSelector((state: RootState) => state.Layout.sideBarType)
    const userData = useSelector((state: RootState) => state.Auth.userData) as ViewUserDetailsResponse | undefined

    // Check timezone mismatch when user data is loaded
    useEffect(() => {
        if (userData && userData.timeZone && !hasCheckedTimezone) {
            const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const mismatch = localTimeZone !== userData.timeZone

            // Only show warning if there's a mismatch AND user hasn't ignored it before
            if (mismatch && userData.id) {
                setShowTZWarning(true)
            }
            setHasCheckedTimezone(true)
        }
    }, [userData, hasCheckedTimezone])
    /**
     * Toggle the leftmenu when having mobile screen
     */
    const handleLeftMenuCallBack = () => {
        const HTMLTag = document.getElementsByTagName('html')[0]
        if (width < 1140) {
            if (sideBarType === SideBarType.LEFT_SIDEBAR_TYPE_SMALL) {
                dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_DEFAULT) as any)
            } else if (sideBarType === SideBarType.LEFT_SIDEBAR_TYPE_MOBILE) {
                showLeftSideBarBackdrop()
                HTMLTag.classList.add('sidenav-enable')
            } else {
                dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_SMALL) as any)
            }
        } else if (sideBarType === SideBarType.LEFT_SIDEBAR_TYPE_SMALL || sideBarType === SideBarType.LEFT_SIDEBAR_TYPE_HIDDEN) {
            dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_DEFAULT) as any)
        } else if (sideBarType === SideBarType.LEFT_SIDEBAR_TYPE_MOBILE) {
            showLeftSideBarBackdrop()
            HTMLTag.classList.add('sidenav-enable')
        } else {
            dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_SMALL) as any)
        }
    }

    /**
     * toggling style to the body tag
     */
    function toggleBodyStyle(set: boolean) {
        if (set == false) {
            document.body.removeAttribute('style')
        } else {
            document.body.style.overflow = 'hidden'
            document.body.style.paddingRight = '16px'
        }
    }

    /**
     * creates backdrop for leftsidebar
     */
    function showLeftSideBarBackdrop() {
        const backdrop = document.createElement('div')
        backdrop.id = 'custom-backdrop'
        backdrop.className = 'transition-all fixed inset-0 z-40 bg-gray-900 bg-opacity-50 dark:bg-opacity-80'
        document.body.appendChild(backdrop)

        backdrop.addEventListener('click', function () {
            document.getElementsByTagName('html')[0].classList.remove('sidenav-enable')
            toggleBodyStyle(false)
            dispatch(changeSideBarType(SideBarType.LEFT_SIDEBAR_TYPE_MOBILE) as any)
            hideLeftSideBarBackdrop()
        })
    }

    function hideLeftSideBarBackdrop() {
        const backdrop = document.getElementById('custom-backdrop')
        document.getElementsByTagName('html')[0].classList.remove('sidenav-enable')
        if (backdrop) {
            document.body.removeChild(backdrop)
            document.body.style.removeProperty('overflow')
        }
    }

    /**
     * Toggle Dark Mode
     */
    const toggleDarkMode = () => {
        if (layoutTheme === 'dark') {
            dispatch(changeLayoutTheme(LayoutTheme.THEME_LIGHT) as any)
        } else {
            dispatch(changeLayoutTheme(LayoutTheme.THEME_DARK) as any)
        }
    }
    /**
     * Handle ignore button
     */
    const handleIgnore = () => {
        setShowTZWarning(false)
    }

    /**
     * Handle update timezone button - update user's timezone to match local system
     */
    const handleUpdateTimezone = async () => {
        if (!userData) return

        const updateRequest = new UpdateUserRequest({
            id: userData.id,
            firstName: userData.firstName ?? '',
            lastName: userData.lastName ?? '',
            timeZone: normalized,
        })

        await runWithToast(
            async () => {
                const response = await personalService.updateProfile(updateRequest)
                const updatedProfile = await personalService.getProfile()
                dispatch(fetchUserProfileSuccess(AuthActionTypes.FETCH_USER_PROFILE, updatedProfile) as any)
                setShowTZWarning(false)
                return response
            },
            {
                onSuccess: (response) => messageHelper.showSuccess(response || 'Timezone updated successfully'),
            }
        )
    }
    /**
     * Toggles the right sidebar
     */
    const handleRightSideBar = () => {
        dispatch(showRightSidebar() as any)
    }

    const mismatch = userData?.timeZone && normalized !== userData.timeZone

    useEffect(() => {
        if (tenantSubscriptionPlan.isOverDue || tenantSubscriptionPlan.latePaymentOverDue || moment(tenantSubscriptionPlan.expiredOn).isBefore(moment())) {
            navigate(MenuLinks.SubscriptionStatus)
        }
    }, [tenantSubscriptionPlan, navigate])

    useEffect(() => {
        const viewSubscriptionPermission = userHasPermission(PermissionTypes.Permissions_MySubscriptions_View)
        if (viewSubscriptionPermission) {
            profileMenus.push({
                label: 'My Subscriptions',
                icon: 'ri-calendar-check-line',
                redirectTo: `${MenuLinks.MySubscriptions}`,
            })
        }
    }, [])
    return (
        <React.Fragment>
            <header className="app-header flex items-center px-4 gap-3.5">
                <LogoBox />

                <button id="button-toggle-menu" className="nav-link p-2" onClick={handleLeftMenuCallBack}>
                    <span className="sr-only">Menu Toggle Button</span>
                    <span className="flex items-center justify-center">
                        <i className="ri-menu-2-fill text-2xl"></i>
                    </span>
                </button>

                <div className="relative hidden lg:block">
                    <TopBarSearch />
                </div>

                <div className="relative ms-auto">
                    Your timezone: <strong> {normalized}</strong>
                </div>
                <div className="relative">
                    <LanguageDropdown />
                </div>

                <div className="relative lg:flex hidden">
                    <NotificationDropdown notifications={notifications} />
                </div>

                {/* <div className="relative lg:flex hidden">
					<AppsDropDown />
				</div> */}

                {/* <div className="flex">
					<button type="button" className="nav-link p-2" onClick={handleRightSideBar}>
						<span className="sr-only">Customization</span>
						<span className="flex items-center justify-center">
							<i className="ri-settings-3-line text-2xl"></i>
						</span>
					</button>
				</div> */}

                <div className="flex">
                    <button id="light-dark-mode" type="button" className="nav-link p-2" onClick={toggleDarkMode}>
                        <span className="sr-only">Light/Dark Mode</span>
                        <span className="flex items-center justify-center">
                            <i className="ri-moon-line text-2xl block dark:hidden"></i>
                            <i className="ri-sun-line text-2xl hidden dark:block"></i>
                        </span>
                    </button>
                </div>

                <div className="md:flex hidden">
                    <MaximizeScreen />
                </div>

                <div className="relative">
                    <ProfileDropDown menuItems={profileMenus} />
                </div>
            </header>
            {mismatch && showTZWarning && <TimeZoneWarning isOpen={showTZWarning} onIgnore={handleIgnore} onUpdate={handleUpdateTimezone} expectedTimeZone={userData?.timeZone} userTimeZone={normalized} />}
        </React.Fragment>
    )
}

export default Topbar
