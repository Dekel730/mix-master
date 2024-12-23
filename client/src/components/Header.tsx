import { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaCocktail } from 'react-icons/fa';
import { IUserProfile } from '../types/user';
import { deleteAuthLocalStorage, getUserPicture } from '../utils/functions';
import { Link } from 'react-router-dom';
import { post } from '../utils/requests';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
	setIsLoading: (isLoading: boolean) => void;
}
const Header = ({ setIsLoading }: HeaderProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navigate = useNavigate();

	const user: IUserProfile = JSON.parse(localStorage.getItem('user') || '{}');

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleLogout = async () => {
		setIsLoading(true);
		await post(
			'/user/logout',
			{},
			(message: string) => {
				toast.error(message);
			},
			() => {
				deleteAuthLocalStorage();
				toast.info('Logged out successfully');
			},
			{
				Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
			}
		);
		setIsLoading(false);
	};

	return (
		<header className="bg-[#212121] p-4 flex justify-between items-center">
			<div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
				<div className="bg-[#D93025] p-2 rounded-lg mr-2">
					<FaCocktail className="w-6 h-6 text-white" />
				</div>
				<h1 className="text-white text-xl font-semibold">Mix Master</h1>
			</div>
			<div className="relative">
				<button
					onClick={toggleMenu}
					className="w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-500 p-0"
				>
					<img
						src={getUserPicture(user.picture)}
						alt="User profile"
						className="w-full h-full object-cover"
					/>
				</button>
				{isMenuOpen && (
					<div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] rounded-lg shadow-xl z-10">
						<ul>
							<li>
								<Link
									to={`/user/${user._id}`}
									onClick={toggleMenu}
									className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-t-lg"
								>
									<FaUser className="inline-block mr-2" />{' '}
									Profile
								</Link>
							</li>
							<li>
								<Link
									to="/settings"
									onClick={toggleMenu}
									className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333]"
								>
									<FaCog className="inline-block mr-2" />{' '}
									Settings
								</Link>
							</li>
							<li>
								<span
									onClick={handleLogout}
									className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333333] rounded-b-lg cursor-pointer"
								>
									<FaSignOutAlt className="inline-block mr-2" />{' '}
									Logout
								</span>
							</li>
						</ul>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
