const useGridReady = () => {
	const onGridReady = (_params: any) => {
		// Get the ag-center-cols-viewport element after the grid is ready
		const viewport = document.querySelector('.ag-center-cols-viewport')

		// Check if the viewport element exists and is an HTMLElement
		if (viewport && viewport instanceof HTMLElement) {
			const currentHeight = parseInt(window.getComputedStyle(viewport).height, 10)
			const newHeight = currentHeight + 100 // Increase height by 100px
			viewport.style.height = `${newHeight}px` // Set the new height
		}
	}

	// Return the onGridReady callback to be used by the component
	return onGridReady
}

export { useGridReady }
