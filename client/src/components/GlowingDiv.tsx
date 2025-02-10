import './GlowingDiv.css';

interface GlowingDivProps {
	children: React.ReactNode;
	style?: React.CSSProperties;
}

const GlowingDiv = ({ children, style }: GlowingDivProps) => {
	return (
		<div className="package w-full" style={style}>
			<div className="package2 w-full" style={style}>
				{children}
			</div>
		</div>
	);
};

export default GlowingDiv;
