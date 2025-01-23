import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authGet, authPut } from '../utils/requests';
import ImagePreview from '../components/ImagePreview';
import CocktailForm from '../components/CocktailForm';
import Loader from '../components/Loader';
import { MAX_DESCRIPTION_LENGTH } from '../utils/consts';

interface UploadedImage {
	id: string;
	file?: File;
	preview: string;
}

export default function EditCocktail() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [deletedImages, setDeletedImages] = useState<string[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const hasRunId = useRef<string | undefined>('');

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

	const handleDeleteImages = (id: string) => {
		setDeletedImages([...deletedImages, id]);
	};

	const {
		control,
		register,
		handleSubmit,
		watch,
		setValue,
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

	const getCocktail = async () => {
		if (!id) {
			toast.error('Cocktail ID is required');
			return;
		}
		setIsLoading(true);
		await authGet(
			`/post/${id}`,
			(message: string) => {
				toast.error(message);
			},
			(data) => {
				setData(data.post);
			}
		);
		setIsLoading(false);
	};

	useEffect(() => {
		if (id !== hasRunId.current) {
			getCocktail();
			hasRunId.current = id;
		}
	}, [id]);

	const setData = (data: {
		title: string;
		description: string;
		ingredients: {
			name: string;
			amount: string;
		}[];
		instructions: string[];
		images: string[];
	}) => {
		setValue('title', data.title);
		setValue('description', data.description);
		setValue('ingredients', data.ingredients);
		setValue(
			'instructions',
			data.instructions.map((instruction: string) => ({
				name: instruction,
			}))
		);
		setUploadedImages(
			data.images.map((image: string) => ({
				id: image,
				preview: `${import.meta.env.VITE_API_ADDRESS}/${image}`,
			}))
		);
	};

	const onSubmit = async (data: any) => {
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

		formData.append('deletedImages', JSON.stringify(deletedImages));

		uploadedImages.forEach((image) => {
			if (image.file) formData.append('images', image.file);
		});

		await authPut(
			`/post/${id}`,
			formData,
			(message) => {
				toast.error(message);
			},
			() => {
				toast.success('Cocktail updated successfully');
				navigate(`/cocktail/${id}`);
			},
			{
				'Content-Type': 'multipart/form-data',
			}
		);
		setIsLoading(false);
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main className="bg-[#121212]">
			<div className="flex flex-col lg:flex-row p-4 justify-center">
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
					handleDeleteImages={handleDeleteImages}
					title="Edit Cocktail"
					submitButtonName="Update Cocktail"
				/>
			</div>

			<ImagePreview
				previewImageSrc={previewImage}
				setPreviewImageSrc={setPreviewImage}
			/>
		</main>
	);
}
