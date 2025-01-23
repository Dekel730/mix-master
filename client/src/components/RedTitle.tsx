interface RedTitleProps {
	title: string;
	className?: string;
}
const RedTitle = ({ title, className }: RedTitleProps) => {
	return (
		<div
			className={`uppercase tracking-wide text-sm text-[#D93025] font-semibold ${className}`}
		>
			{title}
		</div>
	);
};

export default RedTitle;
