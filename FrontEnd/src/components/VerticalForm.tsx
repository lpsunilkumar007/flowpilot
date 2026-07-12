import React, { forwardRef, ReactNode, useImperativeHandle } from 'react'
import { FieldValues, FormProvider, Resolver, useForm } from 'react-hook-form'

interface VerticalFormProps<TFormValues extends FieldValues> {
	defaultValues?: any
	resolver?: Resolver<TFormValues>
	children?: ReactNode
	onSubmit: (data: TFormValues, methods: { reset: () => void }) => void
	formClass?: string
}

const VerticalForm = forwardRef(<TFormValues extends Record<string, any> = Record<string, any>>({ defaultValues, resolver, children, onSubmit, formClass }: VerticalFormProps<TFormValues>, ref: React.Ref<any>) => {
	/*
	 * form methods
	 */
	const methods = useForm<TFormValues>({
		defaultValues,
		resolver,
		mode: 'onChange', // or 'onBlur', for realtime validation
		reValidateMode: 'onChange',
	})

	useImperativeHandle(ref, () => ({
		...methods, // This exposes all react-hook-form methods, including formState, getValues, setValue, etc.
	}))
	const {
		handleSubmit,
		register,
		control,
		formState: { errors, isDirty },
		reset, // Extract reset from methods
	} = methods


	// Helper function to pass props down correctly
	const renderWithProps = (child: ReactNode, index: number): ReactNode => {
		if (!React.isValidElement(child)) return child

		const element = child as React.ReactElement<any>

		// Generate a unique key using the child name or a combination of index and GUID
		const key = element.props.name || `child-${index}`

		// Pass additional props like register and control only for valid React elements
		const newProps = {
			...element.props,
			register: element.props.name ? register : undefined, // Only add register if it has a name
			key, // Ensure the key is included here
			errors,
			control,
		}

		// Handle potential children inside the child component recursively (to support wrapping)
		return React.cloneElement(
			element,
			newProps,
			element.props.children ? React.Children.map(element.props.children, (nestedChild, nestedIndex) => renderWithProps(nestedChild, nestedIndex)) : null
		)
	}

	return (
		<FormProvider {...methods}>
			<form ref={ref} onSubmit={handleSubmit((data) => onSubmit(data, { reset }))} className={formClass ?? ''} noValidate>
				{Array.isArray(children) ? children.map((child, index) => renderWithProps(child, index)) : renderWithProps(children, 0)}
			</form>
		</FormProvider>
	)
}) as <TFormValues extends Record<string, any> = Record<string, any>>(props: VerticalFormProps<TFormValues> & { ref?: React.Ref<HTMLFormElement> }) => React.JSX.Element

export default VerticalForm
