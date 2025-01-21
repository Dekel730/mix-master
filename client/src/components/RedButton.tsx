import Spinner from './Spinner';

interface RedButtonProps {
	handleClick?: () => void;
	Icon?: React.ElementType;
	text: string;
	type?: 'button' | 'submit' | 'reset';
	className?: string;
	iconClassName?: string;
	loading?: boolean;
}

const RedButton = ({
	handleClick,
	Icon,
	text,
	type = 'button',
	className = '',
	iconClassName = '',
	loading,
}: RedButtonProps) => {
	return (
		<button
			disabled={loading}
			type={type}
			className={`bg-[#D93025] hover:bg-[#C12717] text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 gap-3 ${className}`}
			onClick={handleClick}
		>
			{loading && <Spinner />}
			{Icon && !loading && <Icon className={iconClassName} />}
			{!loading && text}
		</button>
	);
};

export default RedButton;
