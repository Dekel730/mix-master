import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { FaBook, FaFileUpload, FaTimes, FaUser } from 'react-icons/fa';
import z from 'zod';
import { IUserSettings } from '../types/user';
import Spinner from './Spinner';
import { authPut } from '../utils/requests';
import { toast } from 'react-toastify';

interface PersonalDetailsProps {
	user: IUserSettings;
	setUser: (user: IUserSettings) => void;
}
const PersonalDetails = ({ user, setUser }: PersonalDetailsProps) => {
	const schema = z.object({
		f_name: z.string().nonempty("First name can't be empty"),
		l_name: z.string().nonempty("Last name can't be empty"),
		bio: z.string().optional(),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: zodResolver(schema) });

	const [fileName, setFileName] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [deleteFile, setDeleteFile] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setDeleteFile(false);
			setSelectedFile(file);
			setFileName(file.name);
		}
	};

	const resetFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setDeleteFile(true);
		setSelectedFile(null);
		setFileName('');
	};

	const handleFileButtonClick = () => {
		fileInputRef.current?.click();
	};

	const submit = async (data: FieldValues) => {
		const formData = new FormData();
		formData.append('f_name', data.f_name);
		formData.append('l_name', data.l_name);
		if (selectedFile) {
			formData.append('picture', selectedFile);
		}
		formData.append('deletePicture', deleteFile.toString());
		formData.append('bio', data.bio);
		setIsLoading(true);
		await authPut(
			'/user',
			formData,
			(message: string) => {
				toast.error(message);
			},
			(data: any) => {
				localStorage.setItem('user', JSON.stringify(data.user));
				setUser({
					f_name: data.user.f_name,
					l_name: data.user.l_name,
					email: data.user.email,
					picture: data.user.picture,
					bio: data.user.bio,
					tokens: data.user.tokens,
				});
				toast.success('Profile updated successfully');
			},
			{
				'Content-Type': 'multipart/form-data',
			}
		);
		setIsLoading(false);
	};

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Personal Details</h2>
			<form onSubmit={handleSubmit(submit)}>
				<div className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="f_name"
							className="text-sm text-gray-400"
						>
							First Name
						</label>
						<div className="relative">
							<input
								{...register('f_name')}
								id="f_name"
								type="text"
								defaultValue={user.f_name}
								placeholder="Enter your first name"
								className={`w-full bg-[#1a1a1a] text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
									errors.f_name
										? 'ring-red-500'
										: 'ring-gray-500'
								} transition-all ${
									errors.f_name ? 'ring-2 ring-red-500' : ''
								}`}
							/>
							<FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						</div>
						<span className="text-red-500 text-sm">
							{errors.f_name &&
								typeof errors.f_name.message === 'string' &&
								errors.f_name.message}
						</span>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="l_name"
							className="text-sm text-gray-400"
						>
							Last Name
						</label>
						<div className="relative">
							<input
								{...register('l_name')}
								id="l_name"
								type="text"
								defaultValue={user.l_name}
								placeholder="Enter your last name"
								className={`w-full bg-[#1a1a1a] ${
									errors.l_name ? 'ring-2 ring-red-500' : ''
								} text-white h-12 rounded-xl pl-10 pr-4 outline-none focus:ring-2 focus:${
									errors.l_name
										? 'ring-red-500'
										: 'ring-gray-500'
								} transition-all `}
							/>
							<FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						</div>
						<span className="text-red-500 text-sm">
							{errors.l_name &&
								typeof errors.l_name.message === 'string' &&
								errors.l_name.message}
						</span>
					</div>
					<div className="space-y-2">
						<label htmlFor="bio" className="text-sm text-gray-400">
							Bio
						</label>
						<div className="relative">
							<textarea
								{...register('bio')}
								defaultValue={user.bio}
								id="bio"
								placeholder="Tell us about yourself..."
								className="w-full bg-[#1a1a1a] text-white h-32 rounded-xl pl-10 pr-4 pt-3 outline-none focus:ring-2 focus:ring-gray-500 transition-all resize-none"
							/>
							<FaBook className="absolute left-3 top-4 text-gray-400" />
						</div>
					</div>
					<div className="space-y-2">
						<label
							htmlFor="file-upload"
							className="text-sm text-gray-400"
						>
							Profile Picture
						</label>
						<div className="relative flex">
							<input
								ref={fileInputRef}
								id="file-upload"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
							<button
								type="button"
								onClick={handleFileButtonClick}
								className="flex-grow bg-[#1a1a1a] text-white h-12 rounded-l-xl pl-10 pr-12 outline-none transition-all text-left overflow-hidden"
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
				</div>
				<div className="w-full flex items-center justify-center space-x-4 mt-6">
					<button
						type="submit"
						className="bg-[#D93025] hover:bg-[#C12717] text-white h-12 rounded-xl font-medium transition-colors px-6"
					>
						{isLoading ? <Spinner /> : 'Save'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default PersonalDetails;
