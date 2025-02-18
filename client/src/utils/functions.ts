import {
	browserName,
	osName,
	isIOS,
	isAndroid,
	isTablet,
} from 'react-device-detect';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

export const isValidURL = (string: string): boolean => {
	try {
		new URL(string);
		return true;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_: any) {
		return false;
	}
};

export const getUserPicture = (user: {
	gender: string;
	picture?: string;
}): string => {
	if (user.picture) {
		return isValidURL(user.picture)
			? user.picture
			: `${import.meta.env.VITE_API_ADDRESS}/${user.picture}`;
	}
	switch (user.gender) {
		case 'Male':
			return '/man-avatar.png';
		case 'Female':
			return '/woman-avatar.png';
		default:
			return '/cocktail.png';
	}
};

export const getDeviceDetails = (): {
	name: string;
	type: string;
	id: string;
} => {
	let id = localStorage.getItem('device_id');
	if (!id) {
		id = uuidv4();
		localStorage.setItem('device_id', id);
	}
	let name = `${browserName} (${osName})`;
	let type = 'desktop';
	if (isIOS) {
		if (isTablet) {
			name = 'iPad';
			type = 'tablet';
		} else {
			name = 'iPhone';
			type = 'mobile';
		}
	} else if (isAndroid) {
		if (isTablet) {
			name = 'Android tablet';
			type = 'tablet';
		} else {
			name = 'Android phone';
			type = 'mobile';
		}
	}
	return { name, type, id };
};

export const formatDate = (date: Date): string => {
	const pad = (n: number) => n.toString().padStart(2, '0');

	const day = pad(date.getDate());
	const month = pad(date.getMonth() + 1); // Months are 0-indexed
	const year = date.getFullYear();
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());

	return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const getError = (
	field: string,
	errors: FieldErrors<FieldValues> | undefined
): string | null | undefined => {
	if (field.includes('.')) {
		const split = field.split('.');
		const count = split.length;
		let error: FieldErrors<FieldValues> | undefined = errors;
		if (!error) {
			return null;
		}
		for (let i = 0; i < count; i++) {
			let key;
			if (!isNaN(parseInt(split[i]))) {
				key = Number(split[i]);
			} else {
				key = split[i];
			}
			error = error[key] as FieldErrors<FieldValues>;
			if (!error) {
				return null;
			}
		}
		return error?.message?.toString();
	}
	if (!errors) {
		return null;
	}
	return errors[field]?.message?.toString();
};
