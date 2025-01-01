import {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from 'react-hook-form';

interface TextAreaProps<TFieldValues extends FieldValues> {
	field: Path<TFieldValues>;
	register: UseFormRegister<TFieldValues>;
	classNames?: string;
	containerClassNames?: string;
	label?: string;
	errors: FieldErrors<TFieldValues>;
	defaultValue?: string;
	placeHolder: string;
	StartIcon?: React.ElementType;
	children?: React.ReactNode;
}

const TextArea = <TFieldValues extends FieldValues>({
	field,
	register,
	errors,
	label = '',
	classNames = '',
	containerClassNames = '',
	defaultValue = '',
	placeHolder,
	StartIcon,
	children,
}: TextAreaProps<TFieldValues>) => {
	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className="relative">
				<textarea
					{...register(field)} // Correctly typed using Path<TFieldValues>
					id={field}
					placeholder={placeHolder}
					defaultValue={defaultValue}
					className={`w-full bg-[#1a1a1a] ${
						errors[field] ? 'ring-2 ring-red-500' : ''
					} text-white h-32 rounded-xl pl-10 pr-4 pt-3 pb-8 outline-none focus:ring-2 focus:${
						errors[field] ? 'ring-red-500' : 'ring-gray-500'
					} transition-all resize-none ${classNames}`}
				/>
				{StartIcon && (
					<StartIcon className="absolute left-3 top-4 text-gray-400" />
				)}
				{children}
			</div>
			<span className="text-red-500 text-sm">
				{errors[field]?.message?.toString()}
			</span>
		</div>
	);
};

export default TextArea;
