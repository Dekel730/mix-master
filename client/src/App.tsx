import { useState } from 'react';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Feed from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import CocktailDetails from './pages/CocktailDetails';
import CocktailNew from './pages/CocktailNew';
import ProtectedRoute from './components/routes/ProtectedRoute';
import UserRestrictedRoute from './components/routes/UserRestrictedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Settings from './pages/Settings';
import Header from './components/Header';
import Loader from './components/Loader';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useAuth } from './context/AuthContext';

TimeAgo.addDefaultLocale(en);

function App() {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { isAuthenticated } = useAuth();

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
								<ProtectedRoute>
									<Feed />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/login"
							element={
								<UserRestrictedRoute>
									<Login />
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/register"
							element={
								<UserRestrictedRoute>
									<Register />
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/cocktail/new/:id"
							element={
								<ProtectedRoute>
									<CocktailNew />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/cocktail/:id"
							element={
								<ProtectedRoute>
									<CocktailDetails />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/user/:id"
							element={
								<ProtectedRoute>
									<UserProfile />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/settings"
							element={
								<ProtectedRoute>
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
