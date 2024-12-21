export const isValidURL = (string: string): boolean => {
	try {
		new URL(string);
		return true;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_: any) {
		return false;
	}
};


export const getUserPicture = (picture: string | undefined): string => {
	if (picture) {
		return isValidURL(picture) ? picture : `${import.meta.env.VITE_API_ADDRESS}/${picture}`;
	}
	return '/cocktail.png';
}