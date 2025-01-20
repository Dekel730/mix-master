import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

export const get = async (
	url: string,
	onFail: (message: string) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	try {
		const response = await api.get(url, {
			headers,
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const post = async (
	url: string,
	data: any,
	onFail: (message: string) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	try {
		const response = await api.post(url, data, {
			headers,
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const put = async (
	url: string,
	data: any,
	onFail: (message: string) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	try {
		const response = await api.put(url, data, {
			headers,
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const del = async (
	url: string,
	onFail: (message: string) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	try {
		const response = await api.delete(url, {
			headers,
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const getAccessToken = async (): Promise<string | null> => {
	const accessToken: string | null = localStorage.getItem('accessToken');
	const expiresAt: string | null = localStorage.getItem('expiresAt');
	if (accessToken && expiresAt && new Date(expiresAt) > new Date()) {
		return accessToken;
	}
	const refreshToken: string | null = localStorage.getItem('refreshToken');
	if (!refreshToken) {
		return null;
	}

	try {
		const response = await api.post(
			'/user/refresh',
			{},
			{
				headers: {
					Authorization: `Bearer ${refreshToken}`,
				},
			}
		);
		if (response.status !== 200) {
			return null;
		}
		localStorage.setItem('accessToken', response.data.accessToken);
		localStorage.setItem('refreshToken', response.data.refreshToken);
		const expiresIn = 50 * 60 * 1000;
		localStorage.setItem(
			'expiresAt',
			new Date(Date.now() + expiresIn).toISOString()
		);
		return response.data.accessToken;
	} catch (error: any) {
		console.error(error);
		return null;
	}
};

export const authGet = async (
	url: string,
	onFail: (message: string, auth?: boolean) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	const accessToken: string | null = await getAccessToken();
	if (!accessToken) {
		onFail('Please login to continue', true);
		return;
	}
	try {
		const response = await api.get(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...headers,
			},
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const authPost = async (
	url: string,
	data: any,
	onFail: (message: string, auth?: boolean) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	const accessToken: string | null = await getAccessToken();
	if (!accessToken) {
		onFail('Please login to continue', true);
		return;
	}
	try {
		const response = await api.post(url, data, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...headers,
			},
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const authPut = async (
	url: string,
	data: any,
	onFail: (message: string, auth?: boolean) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	const accessToken: string | null = await getAccessToken();
	if (!accessToken) {
		onFail('Please login to continue', true);
		return;
	}
	try {
		const response = await api.put(url, data, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...headers,
			},
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export const authDel = async (
	url: string,
	onFail: (message: string, auth?: boolean) => void,
	onSuccess: (data: any) => void,
	headers?: any
) => {
	const accessToken: string | null = await getAccessToken();
	if (!accessToken) {
		onFail('Please login to continue', true);
		return;
	}
	try {
		const response = await api.delete(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...headers,
			},
		});
		if (response.data.success) {
			onSuccess(response.data);
		}
	} catch (error: any) {
		const message = error.response?.data.message || error.message;
		console.error(error);
		onFail(message);
	}
};

export default api;
