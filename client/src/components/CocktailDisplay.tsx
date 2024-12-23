import { FaComment, FaEllipsisV, FaHeart } from 'react-icons/fa';
import { getUserPicture } from '../utils/functions';

interface CocktailDisplayProps {
	cocktail: any;
}

const CocktailDisplay = ({ cocktail }: CocktailDisplayProps) => {
	return (
		<div className="bg-zinc-800 rounded-lg border border-zinc-700">
			<div className="p-4 flex items-center">
				<div className="h-8 w-8 rounded-full overflow-hidden">
					<img
						src={getUserPicture(cocktail.user.picture)}
						alt="Avatar"
						className="h-full w-full object-cover"
					/>
				</div>
				<div className="ml-3 flex-1">
					<p className="text-sm font-medium">
						{cocktail.user.f_name} {cocktail.user.l_name}
					</p>
					<p className="text-xs text-zinc-400">{cocktail.createdAt}</p>
				</div>
				<button className="p-2 hover:bg-zinc-700 rounded-full">
					<FaEllipsisV className="h-4 w-4" />
				</button>
			</div>
			<div className="p-4 space-y-4">
				{cocktail.picture && (
					<img
						src={`${import.meta.env.VITE_API_ADDRESS}/${
							cocktail.picture
						}`}
						alt="Cocktail cocktail"
						className="rounded-lg w-full object-cover"
					/>
				)}
				<div className="flex items-center space-x-4">
					<button className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-[#D93025]/10">
						<FaHeart className="h-4 w-4 text-[#D93025]" />
						<span className="text-[#D93025]">256</span>
					</button>
					<button className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-zinc-700">
						<FaComment className="h-4 w-4" />
						<span>45</span>
					</button>
				</div>
				<p className="text-sm text-zinc-300">
					Share your favorite cocktail recipes with friends
				</p>
			</div>
		</div>
	);
};

export default CocktailDisplay;
