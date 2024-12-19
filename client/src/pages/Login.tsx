import { useState } from 'react';
import Loader from '../components/Loader';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { FieldValues, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface IProps {
	setIsAuthenticated: (isAuthenticated: boolean) => void;
}
const Login = ({ setIsAuthenticated }: IProps) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { register, handleSubmit } = useForm();

	const navigate = useNavigate();

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
				localStorage.setItem('user', JSON.stringify(data.user));
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('refreshToken', data.refreshToken);
				setIsAuthenticated(true);
				toast.success('Logged in successfully');
				navigate('/');
			}
		);
		setIsLoading(false);
	};

	if (isLoading) {
		return <Loader />;
	}
	return (
		<main>
			<form onSubmit={handleSubmit(handleLogin)}>
				<input
					type="email"
					placeholder="Email"
					{...register('email')}
				/>
				<input
					type="password"
					placeholder="Password"
					{...register('password')}
				/>
				<button type="submit">Login</button>
			</form>
		</main>
	);
};

export default Login;
