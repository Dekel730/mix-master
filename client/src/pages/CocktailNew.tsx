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
	const [aiLoading, setIsAiLoading] = useState<boolean>(false);
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [activeOption, setActiveOption] = useState<'manual' | 'ai'>('manual');
	const [ai, setAi] = useState<boolean>(false);

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

	const aiSchema = z.object({
		language: z.enum([
			'English',
			'Hebrew',
			'Spanish',
			'French',
			'German',
			'Italian',
		]),
		difficulty: z.enum(['easy', 'medium', 'expert']),
		ingredients: z.array(
			z.object({
				name: z
					.string()
					.nonempty('Ingredient name is required')
					.max(50, 'Ingredient name is too long'),
			})
		),
	});

	const {
		control,
		register,
		handleSubmit,
		setValue,
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

	const {
		register: registerAI,
		control: controlAI,
		watch: watchAI,
		handleSubmit: handleSubmitAI,
		formState: { errors: errorsAI },
	} = useForm({
		resolver: zodResolver(aiSchema),
		defaultValues: {
			language: 'English',
			difficulty: 'easy',
			ingredients: [{ name: '' }],
		},
	});

	console.log(errors);

	const onAISubmit = async (data: FieldValues) => {
		setIsAiLoading(true);
		await authPost(
			'/post/ai',
			{
				...data,
				ingredients: data.ingredients.map(
					(ingredient: { name: string }) => ingredient.name
				),
			},
			(message) => {
				toast.error(message);
			},
			(data: any) => {
				setActiveOption('manual');
				setValue('title', data.post.title);
				setValue('description', data.post.description);
				setValue('ingredients', data.post.ingredients);
				setValue(
					'instructions',
					data.post.instructions.map((instruction: any) => ({
						name: instruction,
					}))
				);
				setAi(true);
				toast.success('AI generated cocktail');
			}
		);
		setIsAiLoading(false);
	};

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
		formData.append('ai', ai.toString());
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
					<AICocktailForm
						register={registerAI}
						errors={errorsAI}
						control={controlAI}
						handleSubmit={handleSubmitAI}
						watch={watchAI}
						onSubmit={onAISubmit}
						loading={aiLoading}
					/>
				)}
			</div>

			<ImagePreview
				previewImageSrc={previewImage}
				setPreviewImageSrc={setPreviewImage}
			/>
		</main>
	);
}
