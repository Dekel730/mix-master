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
import DrinkDetails from './pages/DrinkDetails';
import ProtectedRoute from './components/routes/ProtectedRoute';
import UserRestrictedRoute from './components/routes/UserRestrictedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Settings from './pages/Settings';
import Header from './components/Header';
import Loader from './components/Loader';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useAuth } from './context/AuthContext';
import Verify from './pages/Verify';
import EmailPassword from './pages/EmailPassword';
import ResetPassword from './pages/ResetPassword';
import EditCocktail from './pages/EditCocktail';
import Page404 from './pages/Page404';

TimeAgo.addDefaultLocale(en);

function App() {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { isAuthenticated } = useAuth();

	if (isLoading) {
		return <Loader />;
	}

	return (
		<>
			<ToastContainer theme="dark" />
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
						<Route path="/verify/:id" element={<Verify />} />
						<Route
							path="/forgot/password/:token/:email"
							element={
								<UserRestrictedRoute>
									<ResetPassword />
								</UserRestrictedRoute>
							}
						/>
						<Route
							path="/forgot/email"
							element={
								<UserRestrictedRoute>
									<EmailPassword />
								</UserRestrictedRoute>
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
							path="/drink/:id"
							element={
								<ProtectedRoute>
									<DrinkDetails />
								</ProtectedRoute>
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
							path="/cocktail/:id/edit"
							element={
								<ProtectedRoute>
									<EditCocktail />
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
						<Route
							path="*"
							element={
								<ProtectedRoute>
									<Page404 />
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
