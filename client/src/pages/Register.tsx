import { useRef, useState } from 'react';
import Loader from '../components/Loader';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
	FaCocktail,
	FaEnvelope,
	FaEye,
	FaEyeSlash,
	FaFileUpload,
	FaLock,
	FaTimes,
	FaUser,
} from 'react-icons/fa';
import GoogleLogin from '../components/GoogleLogin';
import z from 'zod';
import { password_regex } from '../utils/regex';
import { zodResolver } from '@hookform/resolvers/zod';

interface IProps {
	setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const Register = ({ setIsAuthenticated }: IProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const navigate = useNavigate();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [fileName, setFileName] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const schema = z
		.object({
			f_name: z
				.string()
				.min(2, 'First name must be at least 2 characters long'),
			l_name: z
				.string()
				.min(2, 'Last name must be at least 2 characters long'),
			email: z.string().email('Invalid email address'),
			password: z
				.string()
				.regex(password_regex, 'Password is not strong enough'),
			'confirm-password': z.string(),
		})
		.refine((data) => data.password === data['confirm-password'], {
			path: ['confirm-password'], // Path to show the error message on the confirm-password field
			message: 'Passwords must match',
		});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setFileName(file.name);
		}
	};

	const resetFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setSelectedFile(null);
		setFileName('');
	};

	const handleFileButtonClick = () => {
		fileInputRef.current?.click();
	};

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword((prev) => !prev);
	};

	const successfulLogin = (data: any) => {
		localStorage.setItem('user', JSON.stringify(data.user));
		localStorage.setItem('accessToken', data.accessToken);
		localStorage.setItem('refreshToken', data.refreshToken);
		const expiresIn = 50 * 60 * 1000;
		localStorage.setItem(
			'expiresAt',
			new Date(Date.now() + expiresIn).toISOString()
		);
		setIsAuthenticated(true);
	};

	const handleRegister = async (data: FieldValues) => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append('email', data.email);
		formData.append('f_name', data.f_name);
		formData.append('l_name', data.l_name);
		formData.append('password', data.password);
		if (selectedFile) {
			formData.append('picture', selectedFile);
		}
		await post(
			'/user/register',
			formData,
			(message: string) => {
				toast.error(message);
			},
			() => {
				console.log('User registered');
				toast.info('Please verify your email address');
				navigate('/login');
			},
			{
				'Content-Type': 'multipart/form-data',
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
				},
				(message: string) => {
					toast.error(message);
				},
				(data: any) => {
					successfulLogin(data);
				}
			);
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return <Loader />;
	}
	return (
		<main>
			<form onSubmit={handleSubmit(handleRegister)}>
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

							{/* Register form */}
							<div className="space-y-6">
								<h2 className="text-white text-3xl font-bold text-center">
									Register
								</h2>
								<p className="text-gray-400 text-center mb-8">
									Join the cocktail community today
								</p>

								<div className="space-y-4">
									<div className="space-y-2">
										<label
											htmlFor="f_name"
											className="text-sm text-gray-400"
										>
											First Name
										</label>
										<div className="relative">
											<input
												{...register('f_name')}
												id="f_name"
												type="text"
												placeholder="Enter your first name"
												className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
													errors.f_name
														? 'ring-red-500'
														: 'ring-gray-500'
												} transition-all ${
													errors.f_name
														? 'ring-2 ring-red-500'
														: ''
												}`}
											/>
											<FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
										</div>
										<span className="text-red-500 text-sm">
											{errors.f_name &&
												typeof errors.f_name.message ===
													'string' &&
												errors.f_name.message}
										</span>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="l_name"
											className="text-sm text-gray-400"
										>
											Last Name
										</label>
										<div className="relative">
											<input
												{...register('l_name')}
												id="l_name"
												type="text"
												placeholder="Enter your last name"
												className={`w-full bg-[#1a1a1a] ${
													errors.l_name
														? 'ring-2 ring-red-500'
														: ''
												} text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
													errors.l_name
														? 'ring-red-500'
														: 'ring-gray-500'
												} transition-all `}
											/>
											<FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
										</div>
										<span className="text-red-500 text-sm">
											{errors.l_name &&
												typeof errors.l_name.message ===
													'string' &&
												errors.l_name.message}
										</span>
									</div>

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
												placeholder="Create a secure password"
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
										<div className="mt-2 text-gray-400 text-sm">
											<p className="mb-1">
												Password must contain:
											</p>
											<ul className="space-y-1 list-none pl-1">
												{[
													'at least 8 characters',
													'one uppercase letter',
													'one lowercase letter',
													'one number',
												].map((requirement, index) => (
													<li
														key={index}
														className="flex items-start"
													>
														<span className="text-[#D93025] mr-2">
															•
														</span>
														<span>
															{requirement}
														</span>
													</li>
												))}
											</ul>
										</div>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="confirm-password"
											className="text-sm text-gray-400"
										>
											Confirm Password
										</label>
										<div className="relative">
											<input
												{...register(
													'confirm-password'
												)}
												id="confirm-password"
												type={
													showConfirmPassword
														? 'text'
														: 'password'
												}
												placeholder="Confirm your password"
												className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-16 outline-none focus:ring-2 focus:${
													errors['confirm-password']
														? 'ring-red-500'
														: 'ring-gray-500'
												} transition-all ${
													errors['confirm-password']
														? 'ring-2 ring-red-500'
														: ''
												}`}
											/>
											<FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
											<button
												type="button"
												id="confirm-password-toggle"
												onClick={
													toggleConfirmPasswordVisibility
												}
												className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
											>
												{showConfirmPassword ? (
													<FaEyeSlash />
												) : (
													<FaEye />
												)}
											</button>
										</div>
										<span className="text-red-500 text-sm">
											{errors['confirm-password'] &&
												typeof errors[
													'confirm-password'
												].message === 'string' &&
												errors['confirm-password']
													.message}
										</span>
									</div>
									<div className="space-y-2">
										<label
											htmlFor="file-upload"
											className="text-sm text-gray-400"
										>
											Profile Picture
										</label>
										<div className="relative flex">
											<input
												ref={fileInputRef}
												id="file-upload"
												type="file"
												accept="image/*"
												onChange={handleFileChange}
												className="hidden"
											/>
											<button
												type="button"
												onClick={handleFileButtonClick}
												className="flex-grow bg-[#1a1a1a] text-white h-12 rounded-l-xl pl-10 pr-12 outline-none transition-all text-left overflow-hidden"
											>
												{fileName || 'Choose a file'}
											</button>
											<button
												type="button"
												onClick={resetFileInput}
												className="bg-[#2a2a2a] absolute right-0 top-0 text-white h-12 w-12 flex items-center justify-center hover:bg-[#333333] transition-colors"
												aria-label="Reset file selection"
											>
												<FaTimes />
											</button>
											<FaFileUpload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
										</div>
									</div>
								</div>

								<button className="w-full bg-[#D93025] hover:bg-[#C12717] text-white h-12 rounded-xl font-medium transition-colors">
									Register
								</button>

								<div className="relative">
									<hr className="border-t border-gray-600" />
									<span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#212121] px-2 text-gray-400 text-sm">
										or
									</span>
								</div>

								<GoogleLogin authResponse={loginWithGoogle} />

								<p className="text-center text-gray-300">
									Already have an account?{' '}
									<Link
										to="/login"
										className="text-white hover:underline"
									>
										Log in
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

export default Register;
