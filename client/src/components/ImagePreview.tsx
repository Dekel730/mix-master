import { Fragment } from 'react';

interface ImagePreviewProps {
	previewImageSrc: string | null;
	setPreviewImageSrc: (previewImageSrc: string | null) => void;
}
const ImagePreview = ({
	previewImageSrc,
	setPreviewImageSrc,
}: ImagePreviewProps) => {
	const closeImagePreview = () => {
		setPreviewImageSrc(null);
	};
	return (
		<Fragment>
			{previewImageSrc && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onClick={closeImagePreview}
				>
					<div className="max-w-3xl max-h-3xl">
						<img
							src={previewImageSrc}
							alt="Preview"
							className="max-w-full max-h-full object-contain"
						/>
					</div>
				</div>
			)}
		</Fragment>
	);
};

export default ImagePreview;
