import { FaDesktop, FaMobileAlt, FaTabletAlt, FaTimes } from 'react-icons/fa';
import { Device, IUserSettings } from '../types/user';
import { useState } from 'react';
import { authGet } from '../utils/requests';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { formatDate } from '../utils/functions';
import ThanosSnap from './ThanosSnap';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';
import RedButton from './RedButton';
import { AiOutlineDisconnect } from 'react-icons/ai';

interface ConnectedDevicesProps {
	devices: Device[];
	setUser: React.Dispatch<React.SetStateAction<IUserSettings>>;
}

const ConnectedDevices = ({ devices, setUser }: ConnectedDevicesProps) => {
	const deviceId = localStorage.getItem('device_id') || '';
	const { logout } = useAuth();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isLoadingItem, setIsLoadingItem] = useState<string>('');
	const [isDisintegrating, setIsDisintegrating] = useState<string>('');

	const getDeviceIcon = (type: string) => {
		switch (type) {
			case 'desktop':
				return <FaDesktop />;
			case 'mobile':
				return <FaMobileAlt />;
			case 'tablet':
				return <FaTabletAlt />;
			default:
				return <FaDesktop />;
		}
	};

	const disconnectDevice = async (id: string) => {
		setIsLoadingItem(id);
		await authGet(
			`/user/disconnect/${id}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				setIsDisintegrating(id);
				setTimeout(() => {
					setIsDisintegrating('');
					setUser((prev) => ({
						...prev,
						devices: prev.devices.filter(
							(device) => device.device_id !== id
						),
					}));
					if (deviceId === id) {
						toast.info('This device has been disconnected');
						logout();
					}
				}, 2500);
			}
		);
		setIsLoadingItem('');
	};

	const disconnectAllDevices = async () => {
		setIsLoading(true);
		await authGet(
			`/user/disconnect`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			() => {
				toast.info('All devices have been disconnected');
				logout();
			}
		);
		setIsLoading(false);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold">Connected Devices</h2>
				<RedButton
					handleClick={disconnectAllDevices}
					text="Disconnect All"
					Icon={AiOutlineDisconnect}
					iconClassName="w-5 h-5"
				/>
			</div>
			{devices.length > 0 ? (
				<ul className="space-y-4">
					{devices.map((device) => (
						<ThanosSnap
							isDisintegrating={
								isDisintegrating === device.device_id
							}
							key={device.device_id}
						>
							<li className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
								<div className="flex items-center">
									<span className="mr-3 text-xl">
										{getDeviceIcon(device.type)}
									</span>
									<div>
										<h3 className="font-semibold text-white">
											{deviceId === device.device_id
												? device.name + ' (This Device)'
												: device.name}
										</h3>
										<p className="text-sm text-gray-400">
											Connected on:{' '}
											{formatDate(device.createdAt)}
										</p>
									</div>
								</div>
								<button
									disabled={
										isLoadingItem === device.device_id
									}
									onClick={() =>
										disconnectDevice(device.device_id)
									}
									className="bg-[#3a3a3a] text-white p-2 rounded-full hover:bg-[#4a4a4a] transition-colors"
									aria-label={`Disconnect ${device.name}`}
								>
									{isLoadingItem === device.device_id ? (
										<Spinner />
									) : (
										<FaTimes />
									)}
								</button>
							</li>
						</ThanosSnap>
					))}
				</ul>
			) : (
				<p className="text-center text-gray-400 py-4">
					No devices connected
				</p>
			)}
		</div>
	);
};

export default ConnectedDevices;
