import { Link } from 'react-router-dom'

//image
import logoMark from '@/assets/images/logo-sm.png'

const LogoBox = () => {
	return (
		<>
			<Link to="/" className="logo-box">
				{/* Shown on dark / brand chrome */}
				<div className="logo-light">
					<span className="logo-lg inline-flex items-center gap-2.5">
						<img src={logoMark} className="h-10 w-10 object-contain" alt="" />
						<span className="text-[1.15rem] font-semibold tracking-tight text-white whitespace-nowrap">Flow Pilot</span>
					</span>
					<img src={logoMark} className="logo-sm h-9 w-9 object-contain" alt="Flow Pilot" />
				</div>

				{/* Shown on light chrome */}
				<div className="logo-dark">
					<span className="logo-lg inline-flex items-center gap-2.5">
						<img src={logoMark} className="h-10 w-10 object-contain" alt="" />
						<span className="text-[1.15rem] font-semibold tracking-tight text-dark whitespace-nowrap">Flow Pilot</span>
					</span>
					<img src={logoMark} className="logo-sm h-9 w-9 object-contain" alt="Flow Pilot" />
				</div>
			</Link>
		</>
	)
}

export default LogoBox
