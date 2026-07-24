import { Link } from 'react-router-dom'

//image
import logo from '@/assets/images/logo.png'
import logoSm from '@/assets/images/logo-sm.png'
import logoDark from '@/assets/images/logo-dark.png'

const LogoBox = () => {
	return (
		<>
			<Link to="/" className="logo-box">
				<div className="logo-light">
					<span className="logo-lg text-xl font-bold">Flow Pilot</span>
					<span className="logo-sm text-lg font-bold">FP</span>
				</div>

				<div className="logo-dark">
					<span className="logo-lg text-xl font-bold text-white">Flow Pilot</span>
					<span className="logo-sm text-lg font-bold text-white">FP</span>
				</div>
			</Link>
		</>
	)
}

export default LogoBox
