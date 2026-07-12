import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.js'
import { store } from './redux/store.js'
import "./components/LanguageDropdown/i18n";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
const container = document.getElementById('root')
if (container) {
	const root = createRoot(container)
	root.render(
		<Provider store={store}>
			<React.Fragment>
				<BrowserRouter basename={''}>
					<App />
				</BrowserRouter>
			</React.Fragment>
		</Provider>
	)
}
