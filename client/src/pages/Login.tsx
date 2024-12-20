import { useState } from 'react';
import Loader from '../components/Loader';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
	FaCocktail,
	FaEnvelope,
	FaEye,
	FaEyeSlash,
	FaLock,
} from 'react-icons/fa';
import GoogleLogin from '../components/GoogleLogin';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface IProps {
	setIsAuthenticated: (isAuthenticated: boolean) => void;
}
const Login = ({ setIsAuthenticated }: IProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState(false);

	const schema = z.object({
		email: z.string().email('Invalid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(schema) });

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	const successfulLogin = (data: any) => {
		localStorage.setItem('user', JSON.stringify(data.user));
		localStorage.setItem('accessToken', data.accessToken);
		localStorage.setItem('refreshToken', data.refreshToken);
		setIsAuthenticated(true);
		toast.success('Logged in successfully');
		navigate(
			searchParams.get('redirect')
				? `/${searchParams.get('redirect')}`
				: '/'
		);
	};

	const handleLogin = async (data: FieldValues) => {
		setIsLoading(true);
		await post(
			'/user/login',
			{
				email: data.email,
				password: data.password,
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
		console.log(authResult);
		if (authResult['code']) {
			setIsLoading(true);
			await post(
				`/user/google`,
				{
					code: authResult.code,
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
									<div className="space-y-2">
										<label
											htmlFor="email"
											className="text-sm text-gray-400"
										>
											Email
										</label>
										<div className="relative">
											<input
												{...register('email')}
												id="email"
												type="email"
												placeholder="Enter your email address"
												className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
													errors.email
														? 'ring-red-500'
														: 'ring-gray-500'
												} transition-all ${
													errors.email
														? 'ring-2 ring-red-500'
														: ''
												}`}
											/>
											<FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
										</div>
										<span className="text-red-500 text-sm">
											{errors.email &&
												typeof errors.email.message ===
													'string' &&
												errors.email.message}
										</span>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="password"
											className="text-sm text-gray-400"
										>
											Password
										</label>
										<div className="relative">
											<input
												{...register('password')}
												id="password"
												type={
													showPassword
														? 'text'
														: 'password'
												}
												placeholder="Enter your password"
												className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-16 outline-none focus:ring-2 focus:${
													errors.password
														? 'ring-red-500'
														: 'ring-gray-500'
												} transition-all ${
													errors.password
														? 'ring-2 ring-red-500'
														: ''
												}`}
											/>
											<FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
											<button
												type="button"
												id="password-toggle"
												onClick={
													togglePasswordVisibility
												}
												className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
											>
												{showPassword ? (
													<FaEyeSlash />
												) : (
													<FaEye />
												)}
											</button>
										</div>
										<span className="text-red-500 text-sm">
											{errors.password &&
												typeof errors.password
													.message === 'string' &&
												errors.password.message}
										</span>
									</div>
								</div>

								<button
									type="submit"
									className="w-full bg-[#D93025] hover:bg-[#C12717] text-white h-12 rounded-xl font-medium transition-colors hover:border-gray-500"
								>
									Log in
								</button>
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
