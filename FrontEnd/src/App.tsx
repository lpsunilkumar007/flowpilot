import React from 'react'
import AllRoutes from './routes/Routes'

// styles
import 'gridjs/dist/theme/mermaid.min.css'
import './index.scss'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import 'ag-grid-community/styles/ag-grid.css' // Core grid CSS
import 'ag-grid-community/styles/ag-theme-quartz.css' // Quartz theme CSS
import 'react-quill-new/dist/quill.snow.css'
import ReactDOM from 'react-dom'

const App = () => {
	const toastRoot = document.getElementById('toast-root')
	return (
		<React.Fragment>
			<AllRoutes />
			{toastRoot && ReactDOM.createPortal(<ToastContainer />, toastRoot)}
		</React.Fragment>
	)
}

export default App
