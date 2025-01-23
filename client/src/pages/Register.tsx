import { useState } from 'react';
import Loader from '../components/Loader';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FaCocktail, FaEnvelope, FaUser, FaVenusMars } from 'react-icons/fa';
import GoogleLogin from '../components/GoogleLogin';
import z from 'zod';
import { password_regex } from '../utils/regex';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../components/inputs/Input';
import CreatePassword from '../components/CreatePassword';
import FileInput from '../components/inputs/FileInput';
import { getDeviceDetails } from '../utils/functions';
import { GENDER_OPTIONS } from '../utils/consts';
import Select from '../components/inputs/Select';
import { useAuth } from '../context/AuthContext';
import RedButton from '../components/RedButton';

const Register = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { login } = useAuth();

	const navigate = useNavigate();

	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const device = getDeviceDetails();

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
			confirmPassword: z.string(),
			gender: z.enum(['Male', 'Female', 'Other']),
		})
		.refine((data) => data.password === data.confirmPassword, {
			path: ['confirmPassword'], // Path to show the error message on the confirmPassword field
			message: 'Passwords must match',
		});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
	});

	const successfulLogin = (data: any) => {
		localStorage.setItem('user', JSON.stringify(data.user));
		localStorage.setItem('accessToken', data.accessToken);
		localStorage.setItem('refreshToken', data.refreshToken);
		const expiresIn = 50 * 60 * 1000;
		localStorage.setItem(
			'expiresAt',
			new Date(Date.now() + expiresIn).toISOString()
		);
		login(data.user);
	};

	const handleRegister = async (data: FieldValues) => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append('email', data.email);
		formData.append('f_name', data.f_name);
		formData.append('l_name', data.l_name);
		formData.append('password', data.password);
		formData.append('gender', data.gender);
		if (selectedFile) {
			formData.append('picture', selectedFile);
		}
		await post(
			'/user/register',
			formData,
			(message: string) => {
				toast.error(message);
			},
			(data) => {
				console.log('User registered');
				if (!data.sent) {
					toast.error('Email not sent');
				} else {
					toast.info('Please verify your email address');
				}
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
					device,
				},
				(message: string) => {
					toast.error(message);
				},
				(data: any) => {
					successfulLogin(data);
					toast.success('Logged in successfully');
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
									<Input
										field="f_name"
										StartIcon={FaUser}
										label="First Name"
										placeholder="Enter your first name"
										register={register}
										errors={errors}
									/>
									<Input
										field="l_name"
										StartIcon={FaUser}
										label="Last Name"
										placeholder="Enter your last name"
										register={register}
										errors={errors}
									/>

									<Select
										register={register}
										errors={errors}
										label="Gender"
										field="gender"
										options={GENDER_OPTIONS}
										StartIcon={FaVenusMars}
									/>

									<Input
										field="email"
										StartIcon={FaEnvelope}
										inputType="email"
										label="Email"
										placeholder="Enter your email address"
										register={register}
										errors={errors}
									/>

									<CreatePassword
										register={register}
										errors={errors}
									/>

									<FileInput
										label={'Profile Picture'}
										field="picture"
										setSelectedFile={setSelectedFile}
									/>
								</div>
								<RedButton
									text="Register"
									type="submit"
									className="h-12 w-full"
								/>

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
