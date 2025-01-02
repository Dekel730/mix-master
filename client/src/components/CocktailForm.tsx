import {
	FaCocktail,
	FaEye,
	FaInfoCircle,
	FaPlus,
	FaTrash,
} from 'react-icons/fa';
import Input from './inputs/Input';
import {
	Control,
	FieldErrors,
	useFieldArray,
	UseFormHandleSubmit,
	UseFormRegister,
	UseFormSetValue,
	UseFormWatch,
} from 'react-hook-form';
import TextArea from './inputs/TextArea';
import { MAX_DESCRIPTION_LENGTH } from '../utils/consts';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { AiOutlineNumber } from 'react-icons/ai';
import { MdTitle } from 'react-icons/md';
import { PiStepsFill } from 'react-icons/pi';
import { v4 as uuidv4 } from 'uuid';
import { useRef } from 'react';
import { toast } from 'react-toastify';

interface CocktailFormProps {
	onSubmit: (data: IForm) => void;
	handleSubmit: UseFormHandleSubmit<IForm>;
	register: UseFormRegister<IForm>;
	errors: FieldErrors<IForm>;
	control: Control<IForm>;
	watch: UseFormWatch<IForm>;
	uploadedImages: UploadedImage[];
	setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
	setValue: UseFormSetValue<IForm>;
	setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>;
}

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

const CocktailForm = ({
	onSubmit,
	handleSubmit,
	register,
	errors,
	watch,
	control,
	uploadedImages,
	setUploadedImages,
	setValue,
	setPreviewImage,
}: CocktailFormProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const descriptionValue = watch('description', '');

	const ingredientsFieldArray = useFieldArray({
		control,
		name: 'ingredients',
	});

	const instructionsFieldArray = useFieldArray({
		control,
		name: 'instructions',
	});

	const addImage = () => {
		if (uploadedImages.length >= 10) {
			toast.info('You can only upload up to 10 images');
			return;
		}
		fileInputRef.current?.click();
	};

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

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex-grow w-full max-w-3xl bg-[#212121] rounded-3xl p-8 shadow-xl items-start"
		>
			<h2 className="text-white text-3xl font-bold text-center mb-8">
				Create a Cocktail
			</h2>

			<Input
				register={register}
				field={'title'}
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
							onClick={() => {
								ingredientsFieldArray.remove(index);
							}}
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
												steps.splice(stepIndex, 1);
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
										const currentInstructions = [
											...watch('instructions'),
										];
										const currentSteps = [
											...currentInstructions[
												instructionIndex
											].steps,
										];
										currentSteps.push({
											step: '',
											id: uuidv4(),
										});
										currentInstructions[
											instructionIndex
										].steps = currentSteps;
										instructionsFieldArray.replace(
											currentInstructions
										); // Force update
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
									onClick={() => deleteImage(image.id)}
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
		</form>
	);
};

export default CocktailForm;
