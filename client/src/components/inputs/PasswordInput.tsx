import { useState } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

interface PasswordInputProps {
	register: UseFormRegister<FieldValues>;
	errors: FieldErrors<FieldValues>;
	field: string;
	placeholder: string;
	label: string;
	children?: React.ReactNode;
	classNames?: string;
	containerClassNames?: string;
}

const PasswordInput = ({
	register,
	errors,
	field,
	placeholder,
	label,
	children,
	classNames,
	containerClassNames,
}: PasswordInputProps) => {
	classNames = classNames || '';
	containerClassNames = containerClassNames || '';

	const [showPassword, setShowPassword] = useState<boolean>(false);

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className="relative">
				<input
					{...register(field)}
					id={field}
					type={showPassword ? 'text' : 'password'}
					placeholder={placeholder}
					className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-16 outline-none focus:ring-2 focus:${
						errors[field] ? 'ring-red-500' : 'ring-gray-500'
					} transition-all ${
						errors[field] ? 'ring-2 ring-red-500' : ''
					} ${classNames}`}
				/>
				<FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				<button
					type="button"
					id={`${field}-toggle`}
					onClick={togglePasswordVisibility}
					className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
				>
					{showPassword ? <FaEyeSlash /> : <FaEye />}
				</button>
			</div>
			<span className="text-red-500 text-sm">
				{errors[field] &&
					typeof errors[field].message === 'string' &&
					errors[field].message}
			</span>
			{children}
		</div>
	);
};

export default PasswordInput;
