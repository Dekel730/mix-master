import { useState } from 'react';
import Loader from '../components/Loader';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FaCocktail, FaEnvelope } from 'react-icons/fa';
import GoogleLogin from '../components/GoogleLogin';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../components/inputs/Input';
import PasswordInput from '../components/inputs/PasswordInput';
import { getDeviceDetails } from '../utils/functions';
import { useAuth } from '../context/AuthContext';
import RedButton from '../components/RedButton';

const Login = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { login } = useAuth();

	const device = getDeviceDetails();

	const schema = z.object({
		email: z.string().email('Invalid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(schema) });

	const successfulLogin = (data: any) => {
		localStorage.setItem('user', JSON.stringify(data.user));
		localStorage.setItem('accessToken', data.accessToken);
		localStorage.setItem('refreshToken', data.refreshToken);
		localStorage.setItem('userId', data.user.id);
		const expiresIn = 50 * 60 * 1000;
		localStorage.setItem(
			'expiresAt',
			new Date(Date.now() + expiresIn).toISOString()
		);
		toast.success('Logged in successfully');
		login(data.user);
	};

	const handleLogin = async (data: FieldValues) => {
		setIsLoading(true);
		await post(
			'/user/login',
			{
				email: data.email,
				password: data.password,
				device,
			},
			(message: string) => {
				toast.error(message);
			},
			(data: any) => {
				successfulLogin(data);
			}
		);
		setIsLoading(false);
	};

	const loginWithGoogle = async (authResult: any) => {
		if (authResult['code']) {
			setIsLoading(true);
			await post(
				`/user/google`,
				{
					code: authResult.code,
					device,
				},
				(message: string) => {
					toast.error(message);
				},
				(data) => {
					successfulLogin(data);
				}
			);
			setIsLoading(false);
		} else {
			console.error(authResult);
			toast.error('Google login failed');
		}
	};

	if (isLoading) {
		return <Loader />;
	}
	return (
		<main>
			<form onSubmit={handleSubmit(handleLogin)}>
				<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
					<div className="w-full max-w-md relative">
						{/* Main content */}
						<div className="bg-[#212121] rounded-3xl p-8 md:p-12 shadow-xl relative z-10">
							{/* Logo and title */}
							<div className="flex flex-col items-center mb-8">
								<div className="bg-[#D93025] p-3 rounded-xl mb-4">
									<FaCocktail className="w-6 h-6 text-white" />
								</div>
								<h1 className="text-white text-2xl font-semibold mb-1">
									Mix Master
								</h1>
							</div>

							{/* Login form */}
							<div className="space-y-6">
								<h2 className="text-white text-3xl font-bold text-center">
									Log In
								</h2>
								<p className="text-gray-400 text-center mb-8">
									Join the cocktail community today
								</p>

								<div className="space-y-4">
									<Input
										field="email"
										StartIcon={FaEnvelope}
										inputType="email"
										label="Email"
										placeholder="Enter your email address"
										register={register}
										errors={errors}
									/>

									<PasswordInput
										register={register}
										errors={errors}
										field="password"
										placeholder="Enter your password"
										label={'Password'}
									/>
								</div>
								<RedButton
									text="Log in"
									type="submit"
									className="w-full h-12 "
								/>
								<div className="relative">
									<hr className="border-t border-gray-600" />
									<span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#212121] px-2 text-gray-400 text-sm">
										or
									</span>
								</div>

								<GoogleLogin authResponse={loginWithGoogle} />

								<p className="text-center text-gray-300">
									New here?{' '}
									<Link
										to="/register"
										className="text-white hover:underline"
									>
										Join now
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</form>
		</main>
	);
};

export default Login;
