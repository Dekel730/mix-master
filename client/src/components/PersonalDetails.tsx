import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { FaBook } from 'react-icons/fa';
import z from 'zod';
import { IUserSettings } from '../types/user';
import Spinner from './Spinner';
import { authPut } from '../utils/requests';
import { toast } from 'react-toastify';
import Input from './inputs/Input';
import FileInput from './inputs/FileInput';
import TextArea from './inputs/TextArea';

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
	const MAX_BIO_LENGTH = 250;

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
					<Input
						label="First Name"
						field="f_name"
						register={register}
						defaultValue={user.f_name}
						errors={errors}
						placeholder="Enter your first name"
					/>
					<Input
						label="Last Name"
						field="l_name"
						defaultValue={user.l_name}
						register={register}
						errors={errors}
						placeholder="Enter your last name"
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
