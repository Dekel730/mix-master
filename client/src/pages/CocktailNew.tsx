import React, { useState, useRef } from 'react';
import {
	FaPlus,
	FaTrash,
	FaEye,
	FaCocktail,
	FaInfoCircle,
} from 'react-icons/fa';
import Input from '../components/inputs/Input';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import TextArea from '../components/inputs/TextArea';
import ImagePreview from '../components/ImagePreview';
import { MAX_DESCRIPTION_LENGTH } from '../utils/consts';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { AiOutlineNumber } from 'react-icons/ai';
import { MdTitle } from 'react-icons/md';
import { PiStepsFill } from 'react-icons/pi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { authPost } from '../utils/requests';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface IForm {
	title: string;
	description: string;
	ingredients: { name: string; amount: string }[];
	instructions: {
		title: string;
		steps: {
			step: string;
			id: string;
		}[];
	}[];
}

interface UploadedImage {
	id: string;
	file: File;
	preview: string;
}

export default function CreateCocktail() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
					title: z.string().nonempty('Instruction title is required'),
					steps: z
						.array(
							z.object({
								step: z
									.string()
									.nonempty('Step content is required')
									.max(200, 'Step is too long'),
								id: z.string(),
							})
						)
						.min(1, 'At least one step is required'),
				})
			)
			.min(1, 'At least one instruction is required'),
	});

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
			instructions: [
				{
					title: '',
					steps: [
						{
							step: '',
							id: uuidv4(),
						},
					],
				},
			],
		},
	});

	const descriptionValue = watch('description', '');

	const ingredientsFieldArray = useFieldArray({
		control,
		name: 'ingredients',
	});

	const instructionsFieldArray = useFieldArray({
		control,
		name: 'instructions',
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const newImages = Array.from(files).map((file) => ({
				id: Math.random().toString(36).substring(2, 11), // Replace substr with substring
				file,
				preview: URL.createObjectURL(file),
			}));
			setUploadedImages([...uploadedImages, ...newImages]);
			// reset file input
			event.target.value = '';
		}
	};

	const deleteImage = (id: string) => {
		setUploadedImages(uploadedImages.filter((img) => img.id !== id));
	};

	const openImagePreview = (preview: string) => {
		setPreviewImage(preview);
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
					(instruction: {
						title: string;
						steps: { step: string; id: string }[];
					}) => {
						return {
							title: instruction.title,
							steps: instruction.steps.map(
								(step: { step: string; id: string }) =>
									step.step
							),
						};
					}
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

	const addImage = () => {
		if (uploadedImages.length >= 10) {
			toast.info('You can only upload up to 10 images');
			return;
		}
		fileInputRef.current?.click();
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<main className="bg-[#121212]">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex-grow flex justify-center p-4"
			>
				<div className="w-full max-w-3xl bg-[#212121] rounded-3xl p-8 shadow-xl">
					<h2 className="text-white text-3xl font-bold text-center mb-8">
						Create a Cocktail
					</h2>

					<Input
						register={register}
						field="title"
						errors={errors}
						placeholder="Enter cocktail name"
						label="Title"
						StartIcon={FaCocktail}
						containerClassNames="mb-4"
					/>

					<TextArea<IForm>
						register={register}
						errors={errors}
						containerClassNames="mb-4"
						label="Description"
						field="description"
						placeholder="Describe your cocktail..."
						StartIcon={FaInfoCircle}
					>
						<div className="absolute right-4 bottom-2 text-sm text-gray-400">
							{descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}
						</div>
					</TextArea>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Ingredients
						</label>
						<span className="text-red-500 text-sm">
							{errors.ingredients?.root?.message?.toString()}
						</span>
						{ingredientsFieldArray.fields.map((field, index) => (
							<div
								key={field.id}
								className="flex w-full mb-2 space-x-2 bg-[#2a2a2a] p-4 rounded-lg items-start"
							>
								<Input
									containerClassNames="flex-1"
									register={register}
									errors={errors}
									field={`ingredients.${index}.name`}
									placeholder="Ingredient name"
									StartIcon={BiSolidFoodMenu}
								/>
								<Input
									containerClassNames="flex-1"
									register={register}
									errors={errors}
									field={`ingredients.${index}.amount`}
									placeholder="Ingredient Amount"
									StartIcon={AiOutlineNumber}
								/>
								<button
									type="button"
									onClick={() =>
										ingredientsFieldArray.remove(index)
									}
									className="text-red-500 h-12 mt-2"
								>
									<FaTrash />
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={() =>
								ingredientsFieldArray.append({
									name: '',
									amount: '',
								})
							}
							className="mt-2 bg-[#333333] text-white px-4 py-2 rounded-lg hover:bg-[#404040] transition-colors flex items-center"
						>
							<FaPlus className="mr-2" /> Add Ingredient
						</button>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Instructions
						</label>
						<span className="text-red-500 text-sm">
							{errors.instructions?.root?.message?.toString()}
						</span>
						{instructionsFieldArray.fields.map(
							(instruction, instructionIndex) => (
								<div
									key={instruction.id}
									className="mb-4 bg-[#2a2a2a] p-4 rounded-lg"
								>
									<Input
										register={register}
										errors={errors}
										StartIcon={MdTitle}
										field={`instructions.${instructionIndex}.title`}
										placeholder="Instruction title"
									/>

									<div>
										{watch(
											`instructions.${instructionIndex}.steps`
										)?.map((step, stepIndex) => (
											<div
												key={step.id}
												className="flex gap-1 mb-2"
											>
												<TextArea<IForm>
													register={register}
													errors={errors}
													autoExpand={true}
													containerClassNames="flex-1 justify-center"
													height="h-12"
													classNames="p-0 pb-0"
													field={`instructions.${instructionIndex}.steps.${stepIndex}.step`}
													placeholder={`Step ${
														stepIndex + 1
													}`}
													StartIcon={PiStepsFill}
												/>
												<button
													type="button"
													onClick={() => {
														const steps = watch(
															`instructions.${instructionIndex}.steps`
														) as {
															step: string;
															id: string;
														}[];
														steps.splice(
															stepIndex,
															1
														);
														setValue(
															`instructions.${instructionIndex}.steps`,
															steps
														);
													}}
													className="text-red-500 h-12 mt-2"
												>
													<FaTrash />
												</button>
											</div>
										))}
										<button
											type="button"
											onClick={() => {
												const steps = watch(
													`instructions.${instructionIndex}.steps`
												) as {
													step: string;
													id: string;
												}[];
												setValue(
													`instructions.${instructionIndex}.steps`,
													[
														...steps,
														{
															step: '',
															id: uuidv4(),
														},
													]
												);
											}}
											className="mt-2 bg-[#333333] text-white px-4 py-2 rounded-lg flex items-center"
										>
											<FaPlus className="mr-2" /> Add Step
										</button>
									</div>

									<button
										type="button"
										onClick={() => {
											const currentInstructions = [
												...watch('instructions'),
											];
											currentInstructions.splice(
												instructionIndex,
												1
											); // Remove the instruction
											instructionsFieldArray.replace(
												currentInstructions
											); // Force update
											console.log(
												'Updated instructions:',
												watch('instructions')
											);
										}}
										className="text-red-500 mt-2"
									>
										Remove Instruction
									</button>
								</div>
							)
						)}
						<button
							type="button"
							onClick={() => {
								console.log('Button clicked');
								instructionsFieldArray.append({
									title: '',
									steps: [
										{
											step: '',
											id: uuidv4(),
										},
									],
								});
							}}
							className="mt-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg flex items-center"
						>
							<FaPlus className="mr-2" /> Add Instruction
						</button>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Images
						</label>
						<div className="flex flex-wrap gap-4">
							{uploadedImages.map((image) => (
								<div key={image.id} className="relative group">
									<img
										src={image.preview}
										alt="Preview"
										className="w-24 h-24 object-cover rounded-lg"
									/>
									<div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
										<button
											type="button"
											onClick={() =>
												deleteImage(image.id)
											}
											className="text-white p-1 hover:text-red-500 transition-colors"
										>
											<FaTrash />
										</button>
										<button
											type="button"
											onClick={() =>
												openImagePreview(image.preview)
											}
											className="text-white p-1 hover:text-blue-500 transition-colors ml-2"
										>
											<FaEye />
										</button>
									</div>
								</div>
							))}
							<button
								type="button"
								onClick={addImage}
								className="w-24 h-24 bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center hover:bg-[#333333] transition-colors"
							>
								<FaPlus />
							</button>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								className="hidden"
								multiple
								accept="image/*"
							/>
						</div>
					</div>

					<button className="w-full bg-[#D93025] hover:bg-[#C12717] text-white h-12 rounded-xl font-medium transition-colors">
						Create Cocktail
					</button>
				</div>
			</form>

			<ImagePreview
				previewImageSrc={previewImage}
				setPreviewImageSrc={setPreviewImage}
			/>
		</main>
	);
}
