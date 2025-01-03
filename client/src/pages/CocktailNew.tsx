import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import ImagePreview from '../components/ImagePreview';
import { MAX_DESCRIPTION_LENGTH } from '../utils/consts';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { authPost } from '../utils/requests';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CocktailForm from '../components/CocktailForm';
import AICocktailForm from '../components/AICocktailForm';

interface UploadedImage {
	id: string;
	file: File;
	preview: string;
}

export default function CreateCocktail() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [activeOption, setActiveOption] = useState<'manual' | 'ai'>('manual');

	const navigate = useNavigate();

	const cocktailSchema = z.object({
		title: z
			.string()
			.nonempty('Title is required')
			.max(50, 'Title is too long'),
		description: z
			.string()
			.max(
				MAX_DESCRIPTION_LENGTH,
				`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`
			)
			.optional(),
		ingredients: z
			.array(
				z.object({
					name: z
						.string()
						.nonempty('Ingredient name is required')
						.max(50, 'Ingredient name is too long'),
					amount: z
						.string()
						.max(50, 'Ingredient amount is too long')
						.optional(),
				})
			)
			.min(1, 'At least one ingredient is required'),
		instructions: z
			.array(
				z.object({
					name: z
						.string()
						.nonempty('Instruction is required')
						.max(200, 'Instruction is too long'),
				})
			)
			.min(1, 'At least one instruction is required'),
	});

	const {
		control,
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(cocktailSchema),
		defaultValues: {
			title: '',
			description: '',
			ingredients: [{ name: '', amount: '' }],
			instructions: [{ name: '' }],
		},
	});

	console.log(errors);

	const onSubmit = async (data: FieldValues) => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append('title', data.title);
		formData.append('description', data.description);
		formData.append('ingredients', JSON.stringify(data.ingredients));
		formData.append(
			'instructions',
			JSON.stringify(
				data.instructions.map(
					(instruction: { name: string }) => instruction.name
				)
			)
		);
		uploadedImages.forEach((image) => {
			formData.append('images', image.file);
		});
		await authPost(
			'/post',
			formData,
			(message) => {
				toast.error(message);
			},
			(data) => {
				toast.success('Cocktail created successfully');
				navigate(`/cocktail/${data.post._id}`);
			},
			{
				'Content-Type': 'multipart/form-data',
			}
		);
		setIsLoading(false);
	};

	const options = [
		{
			label: 'Create your own',
			onClick: () => setActiveOption('manual'),
			value: 'manual',
		},
		{
			label: 'Create with AI',
			onClick: () => setActiveOption('ai'),
			value: 'ai',
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main className="bg-[#121212]">
			<div className="flex flex-col lg:flex-row p-4 justify-center">
				<Sidebar
					activeOption={activeOption}
					options={options}
					title="Create"
				/>
				{activeOption === 'manual' ? (
					<CocktailForm
						register={register}
						control={control}
						errors={errors}
						watch={watch}
						uploadedImages={uploadedImages}
						setUploadedImages={setUploadedImages}
						setPreviewImage={setPreviewImage}
						onSubmit={onSubmit}
						handleSubmit={handleSubmit}
					/>
				) : (
					<AICocktailForm />
				)}
			</div>

			<ImagePreview
				previewImageSrc={previewImage}
				setPreviewImageSrc={setPreviewImage}
			/>
		</main>
	);
}
