import { useEffect, useState } from 'react';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import Explore from './pages/Explore';
import CocktailDetails from './pages/CocktailDetails';
import CocktailNew from './pages/CocktailNew';
import ProtectedRoute from './components/ProtectedRoute';
import UserRestrictedRoute from './components/UserRestrictedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		() => localStorage.getItem('isAuthenticated') === 'true'
	);

	useEffect(() => {
		localStorage.setItem('isAuthenticated', String(isAuthenticated));
	}, [isAuthenticated]);

	// Update state when localStorage changes
	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === 'isAuthenticated') {
				setIsAuthenticated(event.newValue === 'true');
			}
		};

		// Add the storage event listener
		window.addEventListener('storage', handleStorageChange);

		// Clean up the event listener
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	return (
		<>
			<ToastContainer theme="colored" />
			<GoogleOAuthProvider
				clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
			>
				<Router>
					<Routes>
						<Route
							path="/"
							element={
								<ProtectedRoute
									isAuthenticated={isAuthenticated}
								>
									<Feed />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/login"
							element={
								<UserRestrictedRoute
									isAuthenticated={isAuthenticated}
								>
									<Login
										setIsAuthenticated={setIsAuthenticated}
									/>
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/register"
							element={
								<UserRestrictedRoute
									isAuthenticated={isAuthenticated}
								>
									<Register
										setIsAuthenticated={setIsAuthenticated}
									/>
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/explore"
							element={
								<ProtectedRoute
									isAuthenticated={isAuthenticated}
								>
									<Explore />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/cocktails/new"
							element={
								<ProtectedRoute
									isAuthenticated={isAuthenticated}
								>
									<CocktailNew />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/cocktails/:id"
							element={
								<ProtectedRoute
									isAuthenticated={isAuthenticated}
								>
									<CocktailDetails />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/user/:id"
							element={
								<ProtectedRoute
									isAuthenticated={isAuthenticated}
								>
									<UserProfile />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</Router>
			</GoogleOAuthProvider>
		</>
	);
}

export default App;
