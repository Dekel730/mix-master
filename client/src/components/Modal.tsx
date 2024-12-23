import React, { useEffect, useRef } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmText: string;
	cancelText: string;
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText,
	cancelText,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick);
		}

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div
				ref={modalRef}
				className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg shadow-lg p-6 w-full max-w-md"
			>
				<h2 className="text-xl font-semibold text-white mb-4">
					{title}
				</h2>
				<p className="text-gray-300 mb-6">{description}</p>
				<div className="flex justify-end space-x-4">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-[#2a2a2a] text-white rounded hover:bg-[#3a3a3a] transition-colors"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Modal;
