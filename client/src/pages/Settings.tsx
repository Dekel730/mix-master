import React, { useEffect, useRef, useState } from 'react';
import { FaUser, FaLaptop, FaLock } from 'react-icons/fa';
import PersonalDetails from '../components/PersonalDetails';
import ConnectedDevices from '../components/ConnectedDevices';
import PasswordChange from '../components/PasswordChange';
import Loader from '../components/Loader';
import { authGet } from '../utils/requests';
import { toast } from 'react-toastify';
import { Device, IUserSettings, userSettingsDefault } from '../types/user';

const tabs = [
	{
		id: 'personal',
		label: 'Personal Details',
		icon: FaUser,
		component: PersonalDetails,
	},
	{
		id: 'devices',
		label: 'Connected Devices',
		icon: FaLaptop,
		component: ConnectedDevices,
	},
	{
		id: 'password',
		label: 'Password Change',
		icon: FaLock,
		component: PasswordChange,
	},
];

const Settings: React.FC = () => {
	const [activeTab, setActiveTab] = useState(tabs[0].id);

	const TabContent =
		tabs.find((tab) => tab.id === activeTab)?.component || PersonalDetails;

	const hasRunUser = useRef<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [user, setUser] = useState<IUserSettings>(userSettingsDefault);

	const getUser = async () => {
		if (import.meta.env.VITE_ENV === 'development') {
			if (hasRunUser.current) return;
			hasRunUser.current = true;
		}
		setIsLoading(true);
		await authGet(
			`/user/`,
			(message: string) => {
				toast.error(message);
			},
			(data: any) => {
				setUser({
					...data.user,
					devices: data.user.devices.map((device: Device) => ({
						...device,
						createdAt: new Date(device.createdAt),
					})),
				});
			}
		);
		setIsLoading(false);
	};

	useEffect(() => {
		getUser();
	}, []);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main>
			<div className="w-full min-h-screen bg-[#1a1a1a] p-4 text-white text-center">
				<h1 className="text-2xl font-bold mb-6">Settings</h1>
				<div className="flex flex-col md:flex-row gap-4 text-start">
					{/* Tabs container */}
					<div className="md:w-64 p-4 bg-[#212121] rounded-lg">
						{/* Sidebar for desktop */}
						<div className="hidden md:flex  flex-col space-y-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									className={`flex items-center p-3 rounded-lg transition-colors ${
										activeTab === tab.id
											? 'bg-[#D93025] text-white'
											: 'hover:bg-[#2a2a2a]'
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<tab.icon className="mr-3" />
									{tab.label}
								</button>
							))}
						</div>

						{/* Tabs for mobile */}
						<div className="flex md:hidden scrollbar-hide overflow-x-auto space-x-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									className={`flex items-center p-2 rounded-lg transition-colors whitespace-nowrap ${
										activeTab === tab.id
											? 'bg-[#D93025] text-white'
											: 'bg-[#2a2a2a]'
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<tab.icon className="mr-2" />
									{tab.label}
								</button>
							))}
						</div>
					</div>

					{/* Content container */}
					<div className="flex-1 bg-[#212121] p-4 rounded-lg">
						<TabContent
							user={user}
							setUser={setUser}
							devices={user.devices}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Settings;
