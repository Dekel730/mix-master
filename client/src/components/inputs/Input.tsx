import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface InputProps {
	StartIcon?: React.ElementType;
	startIconClassName?: string;
	inputType?: string;
	placeholder: string;
	defaultValue?: string;
	field: string;
	register: UseFormRegister<FieldValues>;
	classNames?: string;
	containerClassNames?: string;
	label?: string;
	errors: FieldErrors<FieldValues>;
}

const Input = ({
	StartIcon,
	inputType,
	placeholder,
	label,
	defaultValue,
	register,
	field,
	classNames,
	errors,
	startIconClassName,
	containerClassNames,
}: InputProps) => {
	classNames = classNames || '';
	defaultValue = defaultValue || '';
	inputType = inputType || 'text';
	label = label || '';
	startIconClassName = startIconClassName || '';
	containerClassNames = containerClassNames || '';

	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className="relative">
				<input
					{...register(field)}
					id={field}
					type={inputType}
					placeholder={placeholder}
					defaultValue={defaultValue}
					className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
						errors[field] ? 'ring-red-500' : 'ring-gray-500'
					} transition-all ${
						errors[field] ? 'ring-2 ring-red-500' : ''
					} ${classNames}`}
				/>
				{StartIcon && (
					<StartIcon
						className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${startIconClassName}`}
					/>
				)}
			</div>
			<span className="text-red-500 text-sm">
				{errors[field] &&
					typeof errors[field].message === 'string' &&
					errors[field].message}
			</span>
		</div>
	);
};

export default Input;
