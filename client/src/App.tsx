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
import ProtectedRoute from './components/routes/ProtectedRoute';
import UserRestrictedRoute from './components/routes/UserRestrictedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Settings from './pages/Settings';
import Header from './components/Header';
import Loader from './components/Loader';

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		() => localStorage.getItem('isAuthenticated') === 'true'
	);

	const [isLoading, setIsLoading] = useState<boolean>(false);

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

	if (isLoading) {
		return <Loader />;
	}

	return (
		<>
			<ToastContainer theme="colored" />
			<GoogleOAuthProvider
				clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
			>
				<Router>
					{isAuthenticated && <Header setIsLoading={setIsLoading} />}
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
						<Route
							path="/settings"
							element={
								<ProtectedRoute
									isAuthenticated={isAuthenticated}
								>
									<Settings />
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
