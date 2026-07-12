import { useParams } from 'react-router-dom'
import AdministratorMenus from './Components/AdministratorMenus'

type RouteParams = {
	subType: string
}

const ViewSubMenus = () => {
	const { subType } = useParams<RouteParams>()
	return <>{subType === 'administrator' && <AdministratorMenus />}</>
}
export default ViewSubMenus
