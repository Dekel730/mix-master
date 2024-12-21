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

const getAccessToken = async (): Promise<string | null> => {
	const accessToken: string | null = localStorage.getItem('accessToken');
	if (accessToken) {
		return accessToken;
	}
	const refreshToken = localStorage.getItem('refreshToken');
	if (!refreshToken) {
		return null;
	}

	try {
		const response = await api.post('/user/refresh', {
			refreshToken,
		});
		if (response.status !== 200) {
			return null;
		}
		localStorage.setItem('accessToken', response.data.accessToken);
		localStorage.setItem('refreshToken', response.data.refreshToken);
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
		onFail('Failed to get access token', true);
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
		onFail('Failed to get access token', true);
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
		onFail('Failed to get access token', true);
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
		onFail('Failed to get access token', true);
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
