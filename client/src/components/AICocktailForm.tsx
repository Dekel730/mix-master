import {
	Control,
	FieldErrors,
	useFieldArray,
	UseFormHandleSubmit,
	UseFormRegister,
	UseFormWatch,
} from 'react-hook-form';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Select from './inputs/Select';
import { IoLanguageOutline } from 'react-icons/io5';
import { DIFFICULTY_OPTIONS, LANGUAGE_OPTIONS } from '../utils/consts';
import { GiProgression } from 'react-icons/gi';
import AiLoader from './AiLoader';
import Input from './inputs/Input';
import { BiSolidFoodMenu } from 'react-icons/bi';
import RedButton from './RedButton';
import { RiAiGenerate2 } from 'react-icons/ri';

interface IForm {
	language: string;
	difficulty: string;
	ingredients: { name: string }[];
}

interface AiCocktailFormProps {
	onSubmit: (data: IForm) => void;
	handleSubmit: UseFormHandleSubmit<IForm>;
	register: UseFormRegister<IForm>;
	errors: FieldErrors<IForm>;
	watch: UseFormWatch<IForm>;
	control: Control<IForm>;
	loading: boolean;
}

const AICocktailForm = ({
	onSubmit,
	errors,
	handleSubmit,
	register,
	watch,
	control,
	loading,
}: AiCocktailFormProps) => {
	const ingredientsFieldArray = useFieldArray({
		control,
		name: 'ingredients',
	});

	if (loading) {
		return (
			<div className="flex justify-center flex-grow w-full max-w-3xl bg-[#212121] rounded-3xl p-8 shadow-xl items-start">
				<AiLoader />
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex-grow w-full max-w-3xl bg-[#212121] rounded-3xl p-8 shadow-xl items-start"
		>
			<h2 className="text-white text-3xl font-bold text-center mb-8">
				Generate a Cocktail
			</h2>

			<div className="mb-6">
				<Select
					register={register}
					errors={errors}
					label="Language"
					field="language"
					options={LANGUAGE_OPTIONS}
					StartIcon={IoLanguageOutline}
				/>
			</div>

			<div className="mb-6">
				<Select
					register={register}
					errors={errors}
					label="Difficulty"
					field="difficulty"
					options={DIFFICULTY_OPTIONS}
					StartIcon={GiProgression}
				/>
			</div>

			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-400 mb-2">
					Ingredients
				</label>
				<span className="text-red-500 text-sm">
					{errors.ingredients?.root?.message?.toString()}
				</span>
				{ingredientsFieldArray.fields.map(
					(ingredient, ingredientIndex) => (
						<div
							key={ingredient.id}
							className="flex w-full mb-2 space-x-2 bg-[#2a2a2a] p-4 rounded-lg items-start"
						>
							<Input
								containerClassNames="flex-1"
								register={register}
								errors={errors}
								field={`ingredients.${ingredientIndex}.name`}
								placeholder="Ingredient name"
								StartIcon={BiSolidFoodMenu}
							/>

							<button
								type="button"
								onClick={() => {
									const currentInstructions = [
										...watch('ingredients'),
									];
									currentInstructions.splice(
										ingredientIndex,
										1
									); // Remove the instruction
									ingredientsFieldArray.replace(
										currentInstructions
									); // Force update
								}}
								className="text-red-500 h-12 mt-2"
							>
								<FaTrash />
							</button>
						</div>
					)
				)}
				<button
					type="button"
					onClick={() => {
						ingredientsFieldArray.append({
							name: '',
						});
					}}
					className="mt-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-lg flex items-center"
				>
					<FaPlus className="mr-2" /> Add Ingredient
				</button>
			</div>
			<RedButton
				iconClassName="w-6 h-6"
				type="submit"
				Icon={RiAiGenerate2}
				text="Generate Cocktail"
				className="h-12 w-full"
			/>
		</form>
	);
};

export default AICocktailForm;
