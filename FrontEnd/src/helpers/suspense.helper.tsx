import { AnimationSkeleton } from '@/pages/ui/Skeleton'
import React, { Suspense, ComponentType, ReactNode } from 'react'

function withSuspense<T extends object>(WrappedComponent: ComponentType<T>, fallback: ReactNode = <AnimationSkeleton />): React.FC<T> {
	return (props: T) => (
		<Suspense fallback={fallback}>
			<WrappedComponent {...props} />
		</Suspense>
	)
}

export default withSuspense
