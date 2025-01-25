import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import Input from './inputs/Input';
import RedTitle from './RedTitle';
import { HomeQuery } from '../types/home';
import { IUserSearch, UsersData } from '../types/user';
import { FaSearch } from 'react-icons/fa';
import UserList from './UserList';

interface SearchUsersProps {
	users: IUserSearch[];
	setUsers: React.Dispatch<React.SetStateAction<UsersData>>;
	fetchMore: (page?: number, loading?: boolean) => Promise<boolean>;
	pages: number;
	query?: string;
	register: UseFormRegister<HomeQuery>;
	errors: FieldErrors<HomeQuery>;
	setValue: UseFormSetValue<HomeQuery>;
}

const SearchUsers = ({
	users,
	setUsers,
	fetchMore,
	pages,
	query,
	register,
	errors,
	setValue,
}: SearchUsersProps) => {
	return (
		<div className="md:col-span-2">
			<RedTitle title="Search Users" />
			<Input<HomeQuery>
				register={register}
				field="searchUsers"
				placeholder="Search for a user"
				errors={errors}
				StartIcon={FaSearch}
				setValue={setValue}
				debounce={true}
			/>
			<div className="mt-4">
				<UserList
					users={users}
					fetchMore={fetchMore}
					pages={pages}
					setUsers={setUsers}
					query={query}
				/>
			</div>
		</div>
	);
};

export default SearchUsers;
