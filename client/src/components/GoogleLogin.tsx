import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

interface GoogleLoginProps {
	authResponse: (authResult: any) => void;
}

function GoogleLogin(props: GoogleLoginProps) {
	const googleLogin = useGoogleLogin({
		onSuccess: props.authResponse,
		onError: props.authResponse,
		flow: 'auth-code',
	});

	return (
		<button
		id='google'
			onClick={googleLogin}
			className="w-full bg-[#2a2a2a] hover:bg-[#333333] text-white h-12 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
		>
			<FcGoogle className="w-5 h-5" />
			<span>continue with Google</span>
		</button>
	);
}

export default GoogleLogin;
