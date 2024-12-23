export interface IUserProfile {
	_id: string;
	f_name: string;
	l_name: string;
	email: string;
	picture?: string;
	bio?: string;
	self: boolean;
	followers: number;
	following: number;
	createdAt: Date;
	isFollowing: boolean;
}

export const userProfileDefault: IUserProfile = {
	_id: '',
	f_name: '',
	l_name: '',
	email: '',
	self: false,
	followers: 0,
	following: 0,
	createdAt: new Date(),
	isFollowing: false,
};

export interface Device {
	device_id: string;
	createdAt: Date;
	name: string;
	type: string;
}

export interface IUserSettings {
	f_name: string;
	l_name: string;
	email: string;
	picture?: string;
	bio?: string;
	devices: Device[];
}

export const userSettingsDefault: IUserSettings = {
	f_name: '',
	l_name: '',
	email: '',
	devices: [],
};
