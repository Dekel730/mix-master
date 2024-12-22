import z from 'zod';
import { password_regex } from '../utils/regex';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { authPost } from '../utils/requests';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import Spinner from './Spinner';
import CreatePassword from './CreatePassword';

const PasswordChange = () => {
	const schema = z.object({
		password: z
			.string()
			.refine(
				(value) => password_regex.test(value),
				"Password doesn't meet requirements"
			),
		confirmPassword: z
			.string()
			.refine(
				(value) => password_regex.test(value),
				"Password doesn't meet requirements"
			),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FieldValues>({
		resolver: zodResolver(schema),
	});

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const onSubmit = async (data: FieldValues) => {
		setIsLoading(true);
		await authPost(
			'/user/change-password',
			data,
			() => {
				toast.error('Failed to change password');
			},
			() => {
				toast.success('Password changed successfully');
			}
		);
		setIsLoading(false);
	};

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Change Password</h2>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<CreatePassword register={register} errors={errors} />
				<div className="w-full flex items-center justify-center space-x-4 mt-6">
					<button
						type="submit"
						className="bg-[#D93025] hover:bg-[#C12717] text-white h-12 rounded-xl font-medium transition-colors px-6"
					>
						{isLoading ? <Spinner /> : 'Save'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default PasswordChange;
