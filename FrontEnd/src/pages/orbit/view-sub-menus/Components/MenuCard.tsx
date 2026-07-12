import { Link } from 'react-router-dom'

interface MenuCardProps {
	to: string
	icon: string
	label: string
}

const MenuCard = ({ to, icon, label }: MenuCardProps) => (
	<Link to={to}>
		<div className="admin-menu-card">
			<div className="admin-menu-card-inner">
				<div className="admin-menu-icon">
					<i className={`${icon} text-3xl`}></i>
				</div>
				<div className="ml-4">
					<h4 className="admin-menu-title">{label}</h4>
				</div>
			</div>
		</div>
	</Link>
)

export default MenuCard
