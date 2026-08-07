import { useEffect } from 'react'
import { Link } from 'react-router-dom'

//image
import logoMark from '@/assets/images/logo-sm.png'

// components
import AuthContainer from '../../components/AuthPageLayout/AuthContainer'
import { PageBreadcrumb } from '../../components'
import { BrandingDetails } from '@/constants'

const Error404 = () => {
	useEffect(() => {
		if (document.body) {
			document.body.classList.add('authentication-bg')
		}
		return () => {
			if (document.body) {
				document.body.classList.remove('authentication-bg')
			}
		}
	}, [])
	return (
		<>
			<PageBreadcrumb title="Error 404" />
			<AuthContainer>
				<div className="relative flex flex-col items-center justify-center h-screen">
					<div className="flex justify-center">
						<div className="max-w-md px-4 mx-auto">
							<div className="card overflow-hidden">
								<div className="p-9 bg-primary">
									<Link to="/" className="flex items-center justify-center gap-3">
										<img src={logoMark} alt="" className="h-12 w-12 object-contain" />
										<span className="text-2xl font-semibold tracking-tight text-white">Flow Pilot</span>
									</Link>
								</div>

								<div className="px-6 py-10">
									<div className="text-center">
										<h1 className="text-primary text-7xl drop-shadow-xl">
											4<i className="ri-emotion-sad-line"></i>4
										</h1>
										<h4 className="text-danger text-lg uppercase my-7">Page Not Found</h4>
										<p>It's looking like you may have taken a wrong turn. Don't worry... it happens to the best of us. Here's a little tip that might help you get back on track.</p>
										<Link type="button" className="btn bg-info text-white mt-10" to="/">
											<i className="ri-home-4-line me-2"></i> Back to Home
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<footer className="absolute bottom-0 inset-x-0">
					<p className="font-medium text-center p-6">
						{new Date().getFullYear()} © {BrandingDetails.CLIENT_NAME} - {BrandingDetails.CLIENT_WEBSITE}
					</p>
				</footer>
			</AuthContainer>
		</>
	)
}

export default Error404
