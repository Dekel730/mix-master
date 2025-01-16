import { useRef } from 'react';
import {
	FieldErrors,
	FieldValues,
	Path,
	UseFormRegister,
} from 'react-hook-form';
import { getError } from '../../utils/functions';

interface TextAreaProps<TFieldValues extends FieldValues> {
	field: Path<TFieldValues>;
	register: UseFormRegister<TFieldValues>;
	classNames?: string;
	containerClassNames?: string;
	label?: string;
	errors: FieldErrors<TFieldValues>;
	defaultValue?: string;
	placeholder: string;
	StartIcon?: React.ElementType;
	children?: React.ReactNode;
	height?: string;
	autoExpand?: boolean;
}

const TextArea = <TFieldValues extends FieldValues>({
	field,
	register,
	errors,
	label = '',
	classNames = '',
	containerClassNames = '',
	defaultValue = '',
	placeholder,
	StartIcon,
	children,
	height = 'h-32',
	autoExpand = false,
}: TextAreaProps<TFieldValues>) => {
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

	const handleInput = () => {
		if (textAreaRef.current && autoExpand) {
			textAreaRef.current.style.height = 'auto'; // Reset height to calculate correctly
			textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set new height
		}
	};

	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className="relative">
				<textarea
					{...register(field)} // Correctly typed using Path<TFieldValues>
					ref={(instance) => {
						textAreaRef.current = instance; // Attach ref
						register(field).ref(instance); // Register with react-hook-form
					}}
					onInput={handleInput}
					id={field}
					placeholder={placeholder}
					defaultValue={defaultValue}
					className={`w-full bg-[#1a1a1a] ${
						getError(field, errors) ? 'ring-2 ring-red-500' : ''
					} text-white ${height} rounded-xl pl-10 pr-4 pt-3 pb-8 outline-none focus:ring-2 focus:${
						getError(field, errors)
							? 'ring-red-500'
							: 'ring-gray-500'
					} transition-all resize-none ${classNames}`}
				/>
				{StartIcon && (
					<StartIcon className="absolute left-3 top-4 text-gray-400" />
				)}
				{children}
			</div>
			<span className="text-red-500 text-sm">
				{getError(field, errors)}
			</span>
		</div>
	);
};

export default TextArea;
