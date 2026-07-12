import React from 'react'
import { Route } from 'react-router-dom'
import { MenuLinks } from '@/constants/menu'
import type { RoutesProps } from './utils'

const Login = React.lazy(() => import('../pages/auth/Login'))
const Register = React.lazy(() => import('../pages/auth/Register'))
const Logout = React.lazy(() => import('../pages/auth/Logout'))
const RecoverPassword = React.lazy(() => import('../pages/auth/RecoverPassword'))
const LockScreen = React.lazy(() => import('../pages/auth/LockScreen'))
const ConfirmMail = React.lazy(() => import('../pages/auth/ConfirmMail'))
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'))
const RegisterSuccess = React.lazy(() => import('../pages/auth/RegisterSuccess'))
const TwoFactorAuthentication = React.lazy(() => import('@/pages/auth/TwoFactorAuthentication'))
const Login2 = React.lazy(() => import('../pages/auth2/Login2'))
const Register2 = React.lazy(() => import('../pages/auth2/Register2'))
const Logout2 = React.lazy(() => import('../pages/auth2/Logout2'))
const RecoverPassword2 = React.lazy(() => import('../pages/auth2/RecoverPassword2'))
const LockScreen2 = React.lazy(() => import('../pages/auth2/LockScreen2'))
const ConfirmMail2 = React.lazy(() => import('../pages/auth2/ConfirmMail2'))
const ParticipantApproval = React.lazy(() => import('@/pages/orbit/manage-participants-approvals'))
const StartMeeting = React.lazy(() => import('@/pages/orbit/start-meeting'))
const BuySubscriptionPlan = React.lazy(() => import('@/pages/orbit/buy-subscription-plan/Index'))
const SubscriptionStatus = React.lazy(() => import('@/pages/auth/SubscriptionStatus'))
const PaymentConfirmation = React.lazy(() => import('@/pages/orbit/buy-subscription-plan/Components/payment-confirmation'))
const Error404 = React.lazy(() => import('../pages/error/Error404'))
const Error500 = React.lazy(() => import('../pages/error/Error500'))
const MaintenancePages = React.lazy(() => import('../pages/other/Maintenance'))

import PrivateRoute from './PrivateRoute'

export const authRoutes: RoutesProps[] = [
	{ path: MenuLinks.Login, name: 'Login', element: <Login />, route: Route },
	{ path: '/auth/login2', name: 'Login 2', element: <Login2 />, route: Route },
	{ path: MenuLinks.Register, name: 'Register', element: <Register />, route: Route },
	{ path: '/auth/register2', name: 'Register 2', element: <Register2 />, route: Route },
	{ path: '/auth/logout', name: 'Logout', element: <Logout />, route: Route },
	{ path: '/auth/logout2', name: 'Logout 2', element: <Logout2 />, route: Route },
	{ path: '/auth/recover-password', name: 'Recover Password', element: <RecoverPassword />, route: Route },
	{ path: '/auth/recover-password2', name: 'Recover Password 2', element: <RecoverPassword2 />, route: Route },
	{ path: '/auth/lock-screen', name: 'Lock Screen', element: <LockScreen />, route: Route },
	{ path: '/auth/lock-screen2', name: 'Lock Screen 2', element: <LockScreen2 />, route: Route },
	{ path: MenuLinks.ConfirmMail, name: 'Confirm Mail', element: <ConfirmMail />, route: Route },
	{ path: '/auth/confirm-mail2', name: 'Confirm Mail 2', element: <ConfirmMail2 />, route: Route },
	{ path: '/auth/reset-password', name: 'Reset Password', element: <ResetPassword />, route: Route },
	{ path: MenuLinks.RegisterSuccess, name: 'Reset Password', element: <RegisterSuccess />, route: Route },
	{ path: MenuLinks.AppointmentConfirmationUrl, name: 'appointments_confirm', element: <ParticipantApproval />, route: PrivateRoute },
	{ path: MenuLinks.StartMeetingUrl, name: 'Start Meeting', element: <StartMeeting />, route: Route },
	{ path: MenuLinks.BuySubscriptionPlan, name: 'Buy Subscription Plan', element: <BuySubscriptionPlan />, route: Route },
	{ path: MenuLinks.SubscriptionStatus, name: 'Subscription Warning', element: <SubscriptionStatus />, route: Route },
	{ path: MenuLinks.PaymentConfirmation, name: 'Payment Confirmation', element: <PaymentConfirmation />, route: Route },
	{ path: MenuLinks.TwoFactorVerification, name: 'Two Factor Authentication', element: <TwoFactorAuthentication />, route: Route },
]

export const otherPublicRoutes: RoutesProps[] = [
	{ path: '*', name: 'Error - 404', element: <Error404 />, route: Route },
	{ path: '/error-404', name: 'Error - 404', element: <Error404 />, route: Route },
	{ path: '/error-500', name: 'Error - 500', element: <Error500 />, route: Route },
	{ path: '/pages/maintenance', name: 'Maintenance', element: <MaintenancePages />, route: Route },
]
