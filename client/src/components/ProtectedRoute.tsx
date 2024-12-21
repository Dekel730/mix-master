import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
	isAuthenticated: boolean;
	children: React.ReactNode;
}
const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) => {
	const path = window.location.pathname.slice(1);

	if (!isAuthenticated) {
		return (
			<Navigate
				to={path ? `/login?redirect=${path}` : '/login'}
				replace
			/>
		);
	}

	return children;
};

export default ProtectedRoute;
