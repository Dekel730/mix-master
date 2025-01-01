import {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from 'react-hook-form';

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
}: InputProps<TFieldValues>) => {
	const getError = (): string | null | undefined => {
		if (field.includes('.')) {
			const split = field.split('.');
			const count = split.length;
			let error = errors;
			for (let i = 0; i < count; i++) {
				let key;
				if (!isNaN(parseInt(split[i]))) {
					console.log(split[i]);
					key = Number(split[i]);
				} else {
					key = split[i];
				}
				error = error[key];
				if (!error) {
					return null;
				}
			}
			return error?.message?.toString();
		}
		return errors[field]?.message?.toString();
	};

	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className="relative">
				<input
					{...register(field)} // No casting needed; field is correctly typed as Path<TFieldValues>
					id={field}
					type={inputType}
					placeholder={placeholder}
					defaultValue={defaultValue}
					className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
						getError() ? 'ring-red-500' : 'ring-gray-500'
					} transition-all ${
						getError() ? 'ring-2 ring-red-500' : ''
					} ${classNames}`}
				/>
				{StartIcon && (
					<StartIcon
						className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${startIconClassName}`}
					/>
				)}
			</div>
			<span className="text-red-500 text-sm">{getError()}</span>
		</div>
	);
};

export default Input;
