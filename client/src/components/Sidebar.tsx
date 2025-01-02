interface SidebarProps {
	activeOption: 'manual' | 'ai';
	title: string;
	options: {
		label: string;
		onClick: () => void;
		value: string;
	}[];
}

const Sidebar = ({ activeOption, options, title }: SidebarProps) => {
	return (
		<div className="bg-[#212121] p-4 rounded-3xl mb-4 lg:mb-0 lg:mr-4 lg:w-64 flex lg:flex-col text-center">
			<h2 className="text-white text-xl font-bold mb-4 hidden lg:block">
				{title}
			</h2>
			<div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 w-full">
				{options.map((option) => (
					<button
						key={option.value}
						onClick={option.onClick}
						className={`flex-1 lg:flex-none px-4 py-2 rounded-lg transition-colors ${
							activeOption === option.value
								? 'bg-[#D93025] text-white'
								: 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
						}`}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
};

export default Sidebar;
