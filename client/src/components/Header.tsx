import { FaUser, FaCog, FaSignOutAlt, FaCocktail } from 'react-icons/fa';
import { IUserProfile } from '../types/user';
import { getUserPicture } from '../utils/functions';
import { Link } from 'react-router-dom';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import IconMenu from './IconMenu';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
	setIsLoading: (isLoading: boolean) => void;
}
const Header = ({ setIsLoading }: HeaderProps) => {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const user: IUserProfile = JSON.parse(localStorage.getItem('user') || '{}');

	const handleLogout = async () => {
		setIsLoading(true);
		await post(
			'/user/logout',
			{},
			(message: string) => {
				toast.error(message);
			},
			() => {
				toast.info('Logged out successfully');
			},
			{
				Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
			}
		);
		logout();
		setIsLoading(false);
	};

	const options = [
		{
			element: (
				<Link
					to={`/user/${user._id}`}
					className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-t-lg"
				>
					<FaUser className="inline-block mr-2" /> Profile
				</Link>
			),
			onClick: () => navigate(`/user/${user._id}`),
			id: 'profile',
		},
		{
			element: (
				<Link
					to="/settings"
					className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333]"
				>
					<FaCog className="inline-block mr-2" /> Settings
				</Link>
			),
			onClick: () => navigate('/settings'),
			id: 'settings',
		},
		{
			element: (
				<span className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-b-lg cursor-pointer">
					<FaSignOutAlt className="inline-block mr-2" /> Logout
				</span>
			),
			onClick: handleLogout,
			id: 'logout',
		},
	];

	return (
		<header className="bg-[#212121] p-4 flex justify-between items-center">
			<div
				className="flex items-center cursor-pointer"
				onClick={() => navigate('/')}
			>
				<div className="bg-[#D93025] p-2 rounded-lg mr-2">
					<FaCocktail className="w-6 h-6 text-white" />
				</div>
				<h1 className="text-white text-xl font-semibold">Mix Master</h1>
			</div>
			<IconMenu
				Icon={
					<img
						src={getUserPicture(user)}
						alt="User profile"
						className="w-full h-full object-cover"
					/>
				}
				options={options}
			/>
		</header>
	);
};

export default Header;
