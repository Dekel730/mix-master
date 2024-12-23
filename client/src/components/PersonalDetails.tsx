import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { FaBook, FaTrash, FaUser } from 'react-icons/fa';
import z from 'zod';
import { IUserSettings } from '../types/user';
import Spinner from './Spinner';
import { authDel, authPut } from '../utils/requests';
import { toast } from 'react-toastify';
import Input from './inputs/Input';
import FileInput from './inputs/FileInput';
import TextArea from './inputs/TextArea';
import { MAX_BIO_LENGTH } from '../utils/consts';
import Modal from './Modal';
import { deleteAuthLocalStorage } from '../utils/functions';

interface PersonalDetailsProps {
	user: IUserSettings;
	setUser: (user: IUserSettings) => void;
}
const PersonalDetails = ({ user, setUser }: PersonalDetailsProps) => {
	const schema = z.object({
		f_name: z.string().nonempty("First name can't be empty"),
		l_name: z.string().nonempty("Last name can't be empty"),
		bio: z.string().max(250, 'Bio must be less than 250 characters'),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm({ resolver: zodResolver(schema) });

	const bioValue = watch('bio', user.bio || '');

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [deleteFile, setDeleteFile] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const handleDeleteUser = async () => {
		setIsLoading(true);
		await authDel(
			'/user',
			(message: string) => {
				toast.error(message);
			},
			() => {
				deleteAuthLocalStorage();
				toast.info('Account deleted successfully');
				setIsDeleteModalOpen(false);
			}
		);
		setIsLoading(false);
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
					devices: data.user.devices,
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
					<Input
						label="First Name"
						field="f_name"
						register={register}
						defaultValue={user.f_name}
						errors={errors}
						placeholder="Enter your first name"
						StartIcon={FaUser}
					/>
					<Input
						label="Last Name"
						field="l_name"
						defaultValue={user.l_name}
						register={register}
						errors={errors}
						placeholder="Enter your last name"
						StartIcon={FaUser}
					/>

					<TextArea
						register={register}
						errors={errors}
						label="Bio"
						field="bio"
						defaultValue={bioValue}
						placeHolder="Tell us about yourself..."
						StartIcon={FaBook}
					>
						<div className="absolute right-4 bottom-2 text-sm text-gray-400">
							{bioValue.length}/{MAX_BIO_LENGTH}
						</div>
					</TextArea>

					<FileInput
						setSelectedFile={setSelectedFile}
						field="picture"
						label="Profile Picture"
						onReset={() => setDeleteFile(true)}
						onSelect={() => setDeleteFile(false)}
						defaultName={user.picture}
					/>
				</div>
				<div className="flex justify-between items-center mt-6">
					<button
						type="button"
						className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center"
						onClick={() => setIsDeleteModalOpen(true)}
					>
						<FaTrash className="mr-2" />
						Delete Account
					</button>
					<button
						type="submit"
						className="bg-[#D93025] hover:bg-[#C12717] text-white h-12 rounded-xl font-medium transition-colors px-6"
					>
						{isLoading ? <Spinner /> : 'Save'}
					</button>
				</div>
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirm={handleDeleteUser}
					title="Are you absolutely sure?"
					description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
					confirmText="Delete Account"
					cancelText="Cancel"
				/>
			</form>
		</div>
	);
};

export default PersonalDetails;
