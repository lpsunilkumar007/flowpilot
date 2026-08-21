import { useState, InputHTMLAttributes, ReactNode } from 'react'

import { FieldErrors, Control, Controller, FieldValues, Path } from 'react-hook-form'
import Select from 'react-select'
import { BottomSheetSelect } from '.'
import { BottomSheetOption } from './BottomSheetSelect'
import useViewPort from '@/hooks/useViewPort'
import React from 'react'

interface PasswordInputProps<TFieldValues extends FieldValues = FieldValues> {
	name: string
	placeholder?: string
	refCallback?: any
	errors: FieldErrors
	control?: Control<TFieldValues>
	register?: any
	className?: string
}

/* Password Input */
const PasswordInput = <TFieldValues extends FieldValues = FieldValues>({ name, placeholder, refCallback, errors, register, className }: PasswordInputProps<TFieldValues>) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)
	return (
		<>
			<div className="flex items-center">
				<input
					type={showPassword ? 'text' : 'password'}
					placeholder={placeholder}
					name={name}
					id={name}
					ref={(r: HTMLInputElement) => {
						if (refCallback) refCallback(r)
					}}
					className={`${className} ${errors && errors[name] ? 'border-red-500 text-red-700 -me-px' : ''}`}
					{...(register ? register(name) : {})}
					autoComplete={name}
				/>
				<span
					className="px-3 py-1 border rounded-e-md -ms-px dark:border-white/10"
					onClick={() => {
						setShowPassword(!showPassword)
					}}
				>
					<i className={`${showPassword ? 'ri-eye-close-line' : 'ri-eye-line'} text-lg`}></i>
				</span>
			</div>
		</>
	)
}

interface FormInputProps<TFieldValues extends FieldValues = FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	type?: string
	name: string
	placeholder?: string
	register?: any
	errors?: any
	control?: Control<TFieldValues>
	className?: string
	labelContainerClassName?: string
	labelClassName?: string
	containerClass?: string
	refCallback?: any
	children?: ReactNode
	rows?: number
	options?: BottomSheetOption[]
	isMultiSelect?: boolean
}

const FormInput = <TFieldValues extends FieldValues = FieldValues>({ label, type, name, placeholder, register, errors, className, labelClassName, labelContainerClassName, containerClass, refCallback, children, rows, options, isMultiSelect, ...otherProps }: FormInputProps<TFieldValues>) => {
	const { width } = useViewPort()
	const isMobile = width < 768
	const Tag = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input'

	const getOptionsFromChildren = (children: ReactNode): BottomSheetOption[] => {
		const extractedOptions: BottomSheetOption[] = []
		React.Children.forEach(children, (child) => {
			if (React.isValidElement(child)) {
				const element = child as React.ReactElement<any>
				if (element.type === 'option') {
					extractedOptions.push({
						label: element.props.children?.toString() || '',
						value: element.props.value,
					})
				} else if (element.props.children) {
					extractedOptions.push(...getOptionsFromChildren(element.props.children))
				}
			}
		})
		return extractedOptions
	}

	const rawOptions = options && options.length > 0 ? options : getOptionsFromChildren(children)

	const placeholderOption = rawOptions.find((opt) => opt.value === '' || opt.value === undefined)
	const selectPlaceholder = placeholder || placeholderOption?.label || 'Select option'
	const finalOptions = rawOptions.filter((opt) => opt.value !== '' && opt.value !== undefined)

	return (
		<>
			{type === 'hidden' ? (
				<input type={type} name={name} {...(register ? register(name) : {})} {...otherProps} />
			) : (
				<>
					{type === 'password' ? (
						<>
							<div className={containerClass ?? ''}>
								{label && (
									<div className={labelContainerClassName ?? ''}>
										<label className={labelClassName ?? ''} htmlFor={name}>
											{label}
										</label>
										{children}
									</div>
								)}
								<PasswordInput name={name} placeholder={placeholder} refCallback={refCallback} errors={errors} register={register} className={className} />
								{errors && errors[name] && (
									<>
										<div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
											<i className="mgc_warning_fill text-xl text-red-500" />
										</div>
										<p className="text-xs text-red-600 mt-2"> {errors[name]['message']}</p>
									</>
								)}
							</div>
						</>
					) : (
						<>
							{type === 'textarea' ? (
								<>
									<div className={`${containerClass ?? ''} relative`}>
										{label ? (
											<label className={labelClassName ?? ''} htmlFor={name}>
												{label}
											</label>
										) : null}
										<Tag
											placeholder={placeholder}
											name={name}
											id={name}
											rows={rows}
											ref={(r: HTMLInputElement) => {
												if (refCallback) refCallback(r)
											}}
											className={`${className} ${errors && errors[name] ? 'border-red-500 focus:border-red-500 text-red-700 pe-10' : ''}`}
											{...(register ? register(name) : {})}
											{...otherProps}
											autoComplete={name}
										/>
										{errors && errors[name] && <p className="text-xs text-red-600 mt-2">{errors[name]['message']}</p>}
									</div>
								</>
							) : (
								<>
									{type === 'select' ? (
										<>
											<div className={`${containerClass ?? ''} relative`}>
												{label && (
													<label className={labelClassName ?? ''} htmlFor={name}>
														{label}
													</label>
												)}
												<Tag
													name={name}
													id={name}
													ref={(r: HTMLSelectElement) => {
														if (refCallback) refCallback(r)
													}}
													className={className}
													{...(register ? register(name) : {})}
													{...otherProps}
													autoComplete={name}
												>
													{children}
												</Tag>
											</div>
										</>
									) : type === 'bottom-sheet' ? (
										<div className={`${containerClass ?? ''} relative`}>
											{isMobile ? (
												otherProps.control ? (
													<Controller
														name={name as Path<TFieldValues>}
														control={otherProps.control}
														rules={{ required: otherProps.required ? 'This field is required' : false }}
														render={({ field, fieldState }) => (
															<>
																<BottomSheetSelect label={label} placeholder={selectPlaceholder} options={finalOptions} value={field.value} onSelect={field.onChange} labelClassName={labelClassName} triggerClassName={`${className} ${fieldState.error ? 'border-red-500' : ''}`} isMultiSelect={isMultiSelect} />
																{fieldState.error && <p className="text-xs text-red-600 mt-2">{fieldState.error.message}</p>}
															</>
														)}
													/>
												) : (
													<BottomSheetSelect
														label={label}
														placeholder={selectPlaceholder}
														options={finalOptions}
														value={otherProps.value}
														onSelect={(val) => {
															if (otherProps.onChange) {
																otherProps.onChange({
																	target: {
																		name: name,
																		id: name,
																		value: val,
																	},
																} as any)
															}
														}}
														labelClassName={labelClassName}
														triggerClassName={`${className} ${errors && errors[name] ? 'border-red-500' : ''}`}
														isMultiSelect={isMultiSelect}
													/>
												)
											) : (
												<>
													{label && (
														<label className={labelClassName ?? ''} htmlFor={name}>
															{label}
														</label>
													)}
													{isMultiSelect ? (
														otherProps.control ? (
															<Controller
																name={name as Path<TFieldValues>}
																control={otherProps.control}
																rules={{ required: otherProps.required ? 'This field is required' : false }}
																render={({ field, fieldState }) => (
																	<>
																		<Select
																			classNamePrefix="react-select"
																			className={`react-select-container ${fieldState.error ? 'is-invalid' : ''}`}
																			options={finalOptions}
																			isMulti={true}
																			placeholder={selectPlaceholder}
																			value={finalOptions?.filter((opt) => Array.isArray(field.value) && field.value.includes(opt.value))}
																			onChange={(selectedOptions: any) => {
																				field.onChange(selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [])
																			}}
																		/>
																		{fieldState.error && <p className="text-xs text-red-600 mt-2">{fieldState.error.message}</p>}
																	</>
																)}
															/>
														) : (
															<Select
																classNamePrefix="react-select"
																className={`react-select-container ${errors && errors[name] ? 'is-invalid' : ''}`}
																options={finalOptions}
																isMulti={true}
																placeholder={selectPlaceholder}
																value={finalOptions?.filter((opt) => Array.isArray(otherProps.value) && otherProps.value.includes(opt.value))}
																onChange={(selectedOptions: any) => {
																	if (otherProps.onChange) {
																		const values = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : []
																		otherProps.onChange({
																			target: {
																				name: name,
																				id: name,
																				value: values,
																			},
																		} as any)
																	}
																}}
															/>
														)
													) : (
														<>
															<select
																name={name}
																id={name}
																ref={(r: HTMLSelectElement) => {
																	if (refCallback) refCallback(r)
																}}
																className={`${className} ${errors && errors[name] ? 'border-red-500 focus:border-red-500 text-red-700' : ''}`}
																{...(register ? register(name) : {})}
																{...otherProps}
																autoComplete={name}
															>
																<option value="">{selectPlaceholder}</option>
																{finalOptions?.map((opt, idx) => (
																	<option key={idx} value={opt.value}>
																		{opt.label}
																	</option>
																))}
															</select>
															{errors && errors[name] && <p className="text-xs text-red-600 mt-2">{errors[name]['message']}</p>}
														</>
													)}
												</>
											)}
										</div>
									) : (
										<>
											{type === 'checkbox' || type === 'radio' ? (
												<>
													<div className={containerClass ?? ''}>
														<label className={labelClassName ?? ''}>{label}</label>
														<div className="flex items-center">
															<input
																data-switch="success"
																type={type}
																name={name}
																id={name}
																ref={(r: HTMLInputElement) => {
																	if (refCallback) refCallback(r)
																}}
																className={`${className} ${errors && errors[name] ? 'border-red-500 focus:border-red-500 text-red-700  pe-10' : ''}`}
																{...(register ? register(name) : {})}
																{...otherProps}
															/>
															<label data-on-label="Yes" data-off-label="No" htmlFor={name}></label>
														</div>
													</div>
												</>
											) : (
												<>
													<div className={containerClass ?? ''}>
														{label && (
															<label className={labelClassName ?? ''} htmlFor={name}>
																{label}
															</label>
														)}
														<div className="relative">
															<input
																type={type}
																placeholder={placeholder}
																name={name}
																id={name}
																ref={(r: HTMLInputElement) => {
																	if (refCallback) refCallback(r)
																}}
																className={`${className} ${errors && errors[name] ? 'border-red-500 focus:border-red-500 text-red-700  pe-10' : ''}`}
																{...(register ? register(name) : {})}
																{...otherProps}
																autoComplete={name}
															/>
															{errors && errors[name] && (
																<div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-3">
																	<i className="ri-error-warning-fill text-xl text-red-500" />
																</div>
															)}
														</div>
														{errors && errors[name] && <p className="text-xs text-red-600 mt-2">{errors[name]['message']}</p>}
														{children ? children : null}
													</div>
												</>
											)}
										</>
									)}
								</>
							)}
						</>
					)}
				</>
			)}
		</>
	)
}

export default FormInput
