import React from 'react';
import './LikeButton.css';
import Spinner from './Spinner';

interface ButtonProps {
	onClick: () => void;
	isLoading?: boolean;
	label?: string;
	count?: number;
	Icon?: React.ElementType;
}

const Button = ({ onClick, isLoading, label, count, Icon }: ButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={isLoading}
			className="like-button cursor-pointer w-full md:w-fit"
		>
			<label
				className="flex items-center justify-evenly h-full gap-3 mx-2 cursor-pointer flex-1"
			>
				{Icon && <Icon className="w-6 h-6 text-[#505050]" />}
				{isLoading ? (
					<Spinner />
				) : (
					<span className="like-text">{label}</span>
				)}
			</label>
			<span className="counter p-4">{count}</span>
		</button>
	);
};

export default Button;
