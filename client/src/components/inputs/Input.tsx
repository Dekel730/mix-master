import {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
	UseFormSetValue,
} from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import { getError } from '../../utils/functions';

interface InputProps<TFieldValues extends FieldValues> {
	StartIcon?: React.ElementType;
	startIconClassName?: string;
	inputType?: string;
	placeholder: string;
	defaultValue?: string;
	field: Path<TFieldValues>;
	register: UseFormRegister<TFieldValues>;
	classNames?: string;
	containerClassNames?: string;
	label?: string;
	errors: FieldErrors<TFieldValues>;
	relativeContainerStyle?: React.CSSProperties;
	setValue?: UseFormSetValue<TFieldValues>;
	debounce?: boolean;
}

const Input = <TFieldValues extends FieldValues>({
	StartIcon,
	inputType = 'text',
	placeholder,
	label = '',
	defaultValue = '',
	register,
	field,
	classNames = '',
	errors,
	startIconClassName = '',
	containerClassNames = '',
	relativeContainerStyle = {},
	setValue,
	debounce,
}: InputProps<TFieldValues>) => {
	const debounced = useDebouncedCallback((value: string) => {
		if (setValue) {
			const castedValue =
				inputType === 'number'
					? value
						? Number(value)
						: undefined
					: value || ''; // Default to an empty string for text inputs
			setValue(field, castedValue as any); // Use as any to ensure compatibility
		}
	}, 500);

	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className={`relative`} style={{ ...relativeContainerStyle }}>
				<input
					{...register(field)}
					onChange={
						debounce
							? (e) => debounced(e.target.value)
							: register(field).onChange
					}
					id={field}
					type={inputType}
					placeholder={placeholder}
					defaultValue={defaultValue}
					className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
						getError(field, errors) ? 'ring-red-500' : 'ring-gray-500'
					} transition-all ${
						getError(field, errors) ? 'ring-2 ring-red-500' : ''
					} ${classNames}`}
				/>
				{StartIcon && (
					<StartIcon
						className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${startIconClassName}`}
					/>
				)}
			</div>
			<span className="text-red-500 text-sm">{getError(field, errors)}</span>
		</div>
	);
};

export default Input;
