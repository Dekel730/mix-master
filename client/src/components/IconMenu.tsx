import React, { useState } from 'react';

interface IconMenuProps {
	Icon: React.ReactNode;
	options: {
		element:
			| React.ReactNode
			| React.ComponentType<{ className?: string; onClick?: () => void }>;
		onClick: () => void;
		id: string;
	}[];
	buttonClassName?: string;
}
const IconMenu = ({ Icon, options, buttonClassName = '' }: IconMenuProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const clickItem = (onClick: () => void) => {
		onClick();
		toggleMenu();
	};

	return (
		<div className="relative">
			<button
				onClick={toggleMenu}
				className={`w-10 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-500 p-0 ${buttonClassName}`}
			>
				{Icon}
			</button>
			{isMenuOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] rounded-lg shadow-xl z-10">
					<ul>
						{options.map((option) => (
							<li key={option.id}>
								{typeof option.element === 'function' ? (
									<option.element
										onClick={() =>
											clickItem(option.onClick)
										}
									/>
								) : (
									React.cloneElement(
										option.element as React.ReactElement,
										{
											onClick: () =>
												clickItem(option.onClick),
										}
									)
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default IconMenu;
