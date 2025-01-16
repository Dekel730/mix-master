interface RedTitleProps {
	title: string;
}
const RedTitle = ({ title }: RedTitleProps) => {
	return (
		<div className="uppercase tracking-wide text-sm text-[#D93025] font-semibold">
			{title}
		</div>
	);
};

export default RedTitle;
