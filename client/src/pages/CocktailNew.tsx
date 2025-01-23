import { useEffect, useRef, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import ImagePreview from '../components/ImagePreview';
import { MAX_DESCRIPTION_LENGTH } from '../utils/consts';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { authGet, authPost } from '../utils/requests';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CocktailForm from '../components/CocktailForm';
import AICocktailForm from '../components/AICocktailForm';
import { useAuth } from '../context/AuthContext';

interface UploadedImage {
	id: string;
	file?: File;
	preview: string;
}

export default function CreateCocktail() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [aiLoading, setIsAiLoading] = useState<boolean>(false);
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [activeOption, setActiveOption] = useState<'manual' | 'ai'>('manual');
	const [ai, setAi] = useState<boolean>(false);
	const { logout } = useAuth();
	const { id } = useParams();
	const runId = useRef<string>('');

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
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data: any) => {
				setActiveOption('manual');
				setData(data.post);
				setAi(true);
				toast.success('AI generated cocktail');
			}
		);
		setIsAiLoading(false);
	};

	const setData = (data: {
		title: string;
		description: string;
		ingredients: {
			name: string;
			amount: string;
		}[];
		instructions: string[];
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
			if (image.file) formData.append('images', image.file);
		});
		await authPost(
			'/post',
			formData,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
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

	const getCocktailData = async () => {
		setIsLoading(true);
		await authGet(
			`/cocktail/${id}`,
			(message: string, auth?: boolean) => {
				toast.error(message);
				if (auth) {
					logout();
				}
			},
			(data) => {
				setData(data.cocktail);
			}
		);
		setIsLoading(false);
	};

	useEffect(() => {
		if (id && id !== 'build') {
			if (runId.current !== id) {
				runId.current = id;
				getCocktailData();
			}
		}
	}, []);

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
