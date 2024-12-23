import { useRef, useState } from 'react';
import { FaFileUpload, FaTimes } from 'react-icons/fa';

interface FileInputProps {
	setSelectedFile: (file: File | null) => void;
	label: string;
	field: string;
	classNames?: string;
	containerClassNames?: string;
	onReset?: () => void;
	onSelect?: () => void;
	defaultName?: string;
}
const FileInput = ({
	setSelectedFile,
	field,
	label,
	classNames,
	containerClassNames,
	onReset,
	onSelect,
	defaultName,
}: FileInputProps) => {
	classNames = classNames || '';
	containerClassNames = containerClassNames || '';
	defaultName = defaultName || '';
	const [fileName, setFileName] = useState<string>(defaultName);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setFileName(file.name);
			if (onSelect) {
				onSelect();
			}
		}
	};

	const resetFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setSelectedFile(null);
		setFileName('');
		if (onReset) {
			onReset();
		}
	};

	const handleFileButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className={`space-y-2 ${containerClassNames}`}>
			<label htmlFor={field} className="text-sm text-gray-400">
				{label}
			</label>
			<div className="relative flex">
				<input
					ref={fileInputRef}
					id={field}
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					className="hidden"
				/>
				<button
					type="button"
					onClick={handleFileButtonClick}
					className={`flex-grow bg-[#1a1a1a] text-white h-12 rounded-l-xl pl-10 pr-12 outline-none transition-all text-left overflow-hidden ${classNames}`}
				>
					{fileName || 'Choose a file'}
				</button>
				<button
					type="button"
					onClick={resetFileInput}
					className="bg-[#2a2a2a] absolute right-0 top-0 text-white h-12 w-12 flex items-center justify-center hover:bg-[#333333] transition-colors"
					aria-label="Reset file selection"
				>
					<FaTimes />
				</button>
				<FaFileUpload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
			</div>
		</div>
	);
};

export default FileInput;
