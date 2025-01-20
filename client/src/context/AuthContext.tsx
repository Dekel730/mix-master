import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IUserProfile } from '../types/user';

// Define the shape of the context
interface AuthContextType {
	isAuthenticated: boolean;
	login: (user: IUserProfile) => void;
	logout: () => void;
}

// Create the context with a default value (will be overridden by the provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the provider props
interface AuthProviderProps {
	children: ReactNode;
}

// Create the provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		() => localStorage.getItem('isAuthenticated') === 'true'
	);

	// Login function
	const login = () => {
		localStorage.setItem('isAuthenticated', 'true');
		setIsAuthenticated(true);
	};

	// Logout function
	const logout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('expiresAt');
		localStorage.removeItem('user');
		localStorage.setItem('isAuthenticated', 'false');
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

// Create a custom hook for consuming the context
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
