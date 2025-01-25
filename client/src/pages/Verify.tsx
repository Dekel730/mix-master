import { useEffect, useRef, useState } from 'react';
import RedTitle from '../components/RedTitle';
import Spinner from '../components/Spinner';
import { Link, useParams } from 'react-router-dom';
import { get } from '../utils/requests';
import { toast } from 'react-toastify';

const Verify = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const hasRun = useRef<boolean>(false);

	const { id } = useParams();

	const verifyAccount = async () => {
		setIsLoading(true);
		await get(
			`/user/verify/${id}`,
			(message: string) => {
				toast.error(message);
			},
			() => {
				setTimeout(() => {
					setSuccess(true);
					toast.success('your account has been verified');
				});
			}
		);
		setIsLoading(false);
	};

	useEffect(() => {
		if (import.meta.env.VITE_ENV === 'development') {
			if (hasRun.current) return;
			hasRun.current = true;
		}
		verifyAccount();
	}, []);

	return (
		<main>
			<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
				<div className="w-full max-w-md relative">
					<div className="bg-[#212121] rounded-3xl p-8 md:p-12 shadow-xl relative z-10">
						<RedTitle title="Verifying Account..." />
						{isLoading && <Spinner width="w-24" height="h-24" />}
						{success && (
							<span>
								You will be redirected to the login page in a
								few second if not click{' '}
								<Link to={'/login'}>here</Link>
							</span>
						)}
					</div>
				</div>
			</div>
		</main>
	);
};

export default Verify;
