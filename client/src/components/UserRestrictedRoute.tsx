import { Navigate, useSearchParams } from 'react-router-dom';

interface UserRestrictedRouteProps {
	isAuthenticated: boolean;
	children: React.ReactNode;
}

const UserRestrictedRoute = ({
	isAuthenticated,
	children,
}: UserRestrictedRouteProps) => {
	const [searchParams] = useSearchParams();

	if (isAuthenticated) {
		return (
			<Navigate
				to={
					searchParams.get('redirect')
						? `/${searchParams.get('redirect')}`
						: '/'
				}
				replace
			/>
		);
	}

	return children;
};

export default UserRestrictedRoute;
