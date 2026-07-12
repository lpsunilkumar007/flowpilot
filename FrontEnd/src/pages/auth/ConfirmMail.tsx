import { Link, useParams } from 'react-router-dom'

// components
import { PageBreadcrumb } from '../../components'
import AuthLayout from '../../components/AuthPageLayout/AuthLayout'
import AuthContainer from '../../components/AuthPageLayout/AuthContainer'
//image
import mail from '@/assets/images/svg/mail_sent.svg'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { confirmMail, resetAuth } from '@/redux/actions'
import { AppDispatch, RootState } from '@/redux/store'

type RouteParams = {
	userId: string
	code: string
}

const ConfirmMail = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { userId, code } = useParams<RouteParams>()
	const confirmMailMessage = useSelector((state: RootState) => state.Auth.confirmMailMessage) as string | undefined
	const confirmMailError = useSelector((state: RootState) => state.Auth.confirmMailError) as string | undefined
	const loading = useSelector((state: RootState) => state.Auth.loading)

	useEffect(() => {
		dispatch(resetAuth()as any)
	}, [dispatch])

	useEffect(() => {
		if (userId && code) {
			dispatch(confirmMail(userId, code)as any)
		}
	}, [dispatch, userId, code])

	const showmessage = confirmMailMessage ?? confirmMailError ?? ''

	return (
		<>
			<PageBreadcrumb title="Confirm Mail" />
			{(showmessage || loading) && (
				<AuthContainer>
					<AuthLayout hasForm={false} pageImage={mail} authTitle={loading && !showmessage ? 'Confirming your email...' : showmessage}>
						<Link to="/">
							<div className="text-center mb-6">
								<button className="btn bg-primary text-white" type="submit">
									<i className="ri-home-4-line me-1.5"></i> Back To Home{' '}
								</button>
							</div>
						</Link>
					</AuthLayout>
				</AuthContainer>
			)}
		</>
	)
}

export default ConfirmMail
