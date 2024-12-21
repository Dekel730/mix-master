import React from 'react';

const PasswordChange: React.FC = () => {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Change Password</h2>
			<form>
				<div className="mb-4">
					<label htmlFor="current-password" className="block mb-1">
						Current Password
					</label>
					<input
						type="password"
						id="current-password"
						className="w-full p-2 border rounded bg-[#2a2a2a] text-white border-[#3a3a3a]"
					/>
				</div>
				<div className="mb-4">
					<label htmlFor="new-password" className="block mb-1">
						New Password
					</label>
					<input
						type="password"
						id="new-password"
						className="w-full p-2 border rounded bg-[#2a2a2a] text-white border-[#3a3a3a]"
					/>
				</div>
				<div className="mb-4">
					<label htmlFor="confirm-password" className="block mb-1">
						Confirm New Password
					</label>
					<input
						type="password"
						id="confirm-password"
						className="w-full p-2 border rounded bg-[#2a2a2a] text-white border-[#3a3a3a]"
					/>
				</div>
				<button
					type="submit"
					className="bg-[#D93025] text-white px-4 py-2 rounded hover:bg-[#B8271F]"
				>
					Change Password
				</button>
			</form>
		</div>
	);
};

export default PasswordChange;
