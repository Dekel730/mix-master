import React from 'react';
import { FaDesktop, FaMobileAlt, FaTabletAlt } from 'react-icons/fa';

const devices = [
	{ id: 1, name: 'MacBook Pro', type: 'desktop', lastUsed: '2 hours ago' },
	{ id: 2, name: 'iPhone 12', type: 'mobile', lastUsed: '5 minutes ago' },
	{ id: 3, name: 'iPad Air', type: 'tablet', lastUsed: '3 days ago' },
];

const ConnectedDevices: React.FC = () => {
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

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
			<ul className="space-y-4">
				{devices.map((device) => (
					<li
						key={device.id}
						className="flex items-center p-3 bg-[#2a2a2a] rounded-lg"
					>
						<span className="mr-3 text-xl">
							{getDeviceIcon(device.type)}
						</span>
						<div>
							<h3 className="font-semibold text-white">
								{device.name}
							</h3>
							<p className="text-sm text-gray-400">
								Last used: {device.lastUsed}
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ConnectedDevices;
