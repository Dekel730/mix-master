import '../ShiningText.css';

interface ShiningTextProps {
	text: string;
	className?: string;
}
const ShiningText = ({ text, className = '' }: ShiningTextProps) => {
	return (
		<a className={className} data-purple={text}>
			{text}
		</a>
	);
};

export default ShiningText;
