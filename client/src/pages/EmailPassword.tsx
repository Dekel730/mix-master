import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import Input from '../components/inputs/Input';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaCocktail, FaEnvelope } from 'react-icons/fa';
import RedButton from '../components/RedButton';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const EmailPassword = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const navigate = useNavigate();

	const schema = z.object({
		email: z.string().email('Invalid email address'),
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(schema) });

	const handleEmailSent = async (data: FieldValues) => {
		setIsLoading(true);
		await post(
			'/user/forgot/email',
			{
				email: data.email,
			},
			(message: string) => {
				toast.error(message);
			},
			(data) => {
				if (data.sent) {
					toast.success('Email sent');
					navigate('/login');
				} else {
					toast.error('Email not sent');
				}
			}
		);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main>
			<form onSubmit={handleSubmit(handleEmailSent)}>
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
									Forgot password
								</h2>
								<p className="text-gray-400 text-center mb-8">
									Enter your email address to reset your
									password
								</p>
								<Input
									label="Email"
									placeholder="Email"
									StartIcon={FaEnvelope}
									inputType="email"
									errors={errors}
									register={register}
									field="email"
								/>
								<RedButton
									type="submit"
									text="Send"
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

export default EmailPassword;
