import {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from 'react-hook-form';

interface SelectProps<TFieldValues extends FieldValues> {
	StartIcon?: React.ElementType;
	startIconClassName?: string;
	defaultValue?: string;
	field: Path<TFieldValues>;
	register: UseFormRegister<TFieldValues>;
	classNames?: string;
	containerClassNames?: string;
	label?: string;
	errors: FieldErrors<TFieldValues>;
	options: { value: string; label: string }[];
}

const Select = <TFieldValues extends FieldValues>({
	StartIcon,
	label = '',
	register,
	field,
	classNames = '',
	errors,
	startIconClassName = '',
	containerClassNames = '',
	options,
}: SelectProps<TFieldValues>) => {
	const getError = (): string | null | undefined => {
		if (field.includes('.')) {
			const split = field.split('.');
			const count = split.length;
			let error: FieldErrors<TFieldValues> | undefined = errors;
			for (let i = 0; i < count; i++) {
				let key;
				if (!isNaN(parseInt(split[i]))) {
					key = Number(split[i]);
				} else {
					key = split[i];
				}
				error = error[key] as FieldErrors<TFieldValues>;
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
				<select
					id={field}
					className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none appearance-none focus:ring-2 focus:${
						getError() ? 'ring-red-500' : 'ring-gray-500'
					} transition-all ${
						getError() ? 'ring-2 ring-red-500' : ''
					} ${classNames}`}
                    {...register(field)}
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>

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

export default Select;
