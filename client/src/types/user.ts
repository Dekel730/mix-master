export interface IUserProfile {
	_id: string;
	f_name: string;
	l_name: string;
	email: string;
	picture?: string;
	gender: string;
	bio?: string;
	self: boolean;
	followers: number;
	following: number;
	createdAt: Date;
	isFollowing: boolean;
}

export interface IUserSearch {
	_id: string;
	f_name: string;
	l_name: string;
	picture?: string;
	gender: string;
	bio?: string;
	followers: number;
	following: number;
	createdAt: string;
}

export const userProfileDefault: IUserProfile = {
	_id: '',
	f_name: '',
	l_name: '',
	email: '',
	gender: 'Other',
	self: false,
	followers: 0,
	following: 0,
	createdAt: new Date(),
	isFollowing: false,
};

export interface UsersData {
	users: IUserSearch[];
	count: number;
	pages: number;
}

export const usersDataDefault: UsersData = {
	users: [],
	count: 0,
	pages: 0,
};

export interface Device {
	device_id: string;
	createdAt: Date;
	name: string;
	type: string;
}

export interface UserPost {
	_id: string;
	gender: string;
	f_name: string;
	l_name: string;
	picture?: string;
}

export interface IUserSettings {
	f_name: string;
	l_name: string;
	email: string;
	picture?: string;
	gender: string;
	bio?: string;
	devices: Device[];
}

export const userSettingsDefault: IUserSettings = {
	f_name: '',
	l_name: '',
	email: '',
	gender: 'Other',
	devices: [],
};
