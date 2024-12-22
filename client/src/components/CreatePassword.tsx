import { Fragment } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import PasswordInput from './inputs/PasswordInput';

interface CreatePasswordProps {
	register: UseFormRegister<FieldValues>;
	errors: FieldErrors<FieldValues>;
    passwordContainerClassNames?: string;
    confirmPasswordContainerClassNames?: string;
    passwordClassNames?: string;
    confirmPasswordClassNames?: string;
}

const CreatePassword = ({ register, errors, passwordClassNames, passwordContainerClassNames, confirmPasswordClassNames, confirmPasswordContainerClassNames }: CreatePasswordProps) => {
	return (
		<Fragment>
			<PasswordInput
				register={register}
				errors={errors}
				field="password"
				placeholder="Create a secure password"
				label="Password"
                containerClassNames={passwordContainerClassNames}
                classNames={passwordClassNames}
			>
				<div className="mt-2 text-gray-400 text-sm">
					<p className="mb-1">Password must contain:</p>
					<ul className="space-y-1 list-none pl-1">
						{[
							'at least 8 characters',
							'one uppercase letter',
							'one lowercase letter',
							'one number',
						].map((requirement, index) => (
							<li key={index} className="flex items-start">
								<span className="text-[#D93025] mr-2">•</span>
								<span>{requirement}</span>
							</li>
						))}
					</ul>
				</div>
			</PasswordInput>

			<PasswordInput
				register={register}
				errors={errors}
				field="confirmPassword"
				placeholder="Confirm your password"
				label="Confirm Password"
                containerClassNames={confirmPasswordContainerClassNames}
                classNames={confirmPasswordClassNames}
			/>
		</Fragment>
	);
};

export default CreatePassword;
