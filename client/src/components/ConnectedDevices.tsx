import { FaDesktop, FaMobileAlt, FaTabletAlt, FaTimes } from 'react-icons/fa';
import { Device, IUserSettings } from '../types/user';
import { useState } from 'react';
import { authGet } from '../utils/requests';
import { toast } from 'react-toastify';
import Loader from './Loader';
import { deleteAuthLocalStorage, formatDate } from '../utils/functions';

interface ConnectedDevicesProps {
	devices: Device[];
	setUser: React.Dispatch<React.SetStateAction<IUserSettings>>;
}

const ConnectedDevices = ({ devices, setUser }: ConnectedDevicesProps) => {
	const deviceId = localStorage.getItem('device_id') || '';

	const [isLoading, setIsLoading] = useState<boolean>(false);

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
		setIsLoading(true);
		await authGet(
			`/user/disconnect/${id}`,
			(message: string) => {
				toast.error(message);
			},
			() => {
				if (deviceId === id) {
					deleteAuthLocalStorage();
					toast.info('This device has been disconnected');
					return;
				}
				setUser((prev) => ({
					...prev,
					devices: prev.devices.filter(
						(device) => device.device_id !== id
					),
				}));
			}
		);
		setIsLoading(false);
	};

	const disconnectAllDevices = async () => {
		setIsLoading(true);
		await authGet(
			`/user/disconnect`,
			(message: string) => {
				toast.error(message);
			},
			() => {
				deleteAuthLocalStorage();
				toast.info('All devices have been disconnected');
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
				<button
					onClick={disconnectAllDevices}
					className="bg-[#D93025] text-white px-4 py-2 rounded hover:bg-[#B8271F] transition-colors"
				>
					Disconnect All
				</button>
			</div>
			{devices.length > 0 ? (
				<ul className="space-y-4">
					{devices.map((device) => (
						<li
							key={device.device_id}
							className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg"
						>
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
								onClick={() =>
									disconnectDevice(device.device_id)
								}
								className="bg-[#3a3a3a] text-white p-2 rounded-full hover:bg-[#4a4a4a] transition-colors"
								aria-label={`Disconnect ${device.name}`}
							>
								<FaTimes />
							</button>
						</li>
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
