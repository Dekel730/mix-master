import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues, useForm } from 'react-hook-form';
import z from 'zod';
import { password_regex } from '../utils/regex';
import { FaCocktail } from 'react-icons/fa';
import RedButton from '../components/RedButton';
import CreatePassword from '../components/CreatePassword';
import { useState } from 'react';
import { post } from '../utils/requests';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const ResetPassword = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { token, email } = useParams();
	const navigate = useNavigate();

	const schema = z
		.object({
			password: z
				.string()
				.regex(password_regex, 'Password is not strong enough'),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			path: ['confirmPassword'], // Path to show the error message on the confirmPassword field
			message: 'Passwords must match',
		});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(schema) });

	const handleResetPassword = async (data: FieldValues) => {
		setIsLoading(true);
		await post(
			`/user/forgot/password/${token}/${email}`,
			{
				password: data.password,
			},
			(message: string) => {
				toast.error(message);
			},
			() => {
				toast.success('Password reset successfully');
				navigate('/login');
			}
		);
		setIsLoading(false);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main>
			<form onSubmit={handleSubmit(handleResetPassword)}>
				<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
					<div className="w-full max-w-md relative">
						<div className="bg-[#212121] rounded-3xl p-8 md:p-12 shadow-xl relative z-10">
							<div className="flex flex-col items-center mb-6">
								<div className="bg-[#D93025] p-3 rounded-xl mb-4">
									<FaCocktail className="w-6 h-6 text-white" />
								</div>
								<h1 className="text-white text-2xl font-semibold mb-1">
									Mix Master
								</h1>
							</div>
							<div className="space-y-6">
								<h2 className="text-white text-3xl font-bold text-center mb-2">
									Reset password
								</h2>
								<CreatePassword
									register={register}
									errors={errors}
								/>
								<RedButton
									type="submit"
									text="Reset password"
									className="w-full h-12"
								/>
							</div>
						</div>
					</div>
				</div>
			</form>
		</main>
	);
};

export default ResetPassword;
