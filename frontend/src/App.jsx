import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import Reviews from "./pages/Reviews";
import MyReviews from './pages/MyReviews';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MovieSearch from "./pages/MovieSearch";
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';

// Component to manage layout and conditional Navbar rendering
function AppWrapper() {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // Determine if the current page is an authentication page (Login/Signup)
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        // Main application container - ensures minimum height, inherits background from body (index.css)
        // Using flex-col allows for potential footer placement later
        <div className="flex flex-col min-h-screen">
            {/* Conditionally render Navbar if user is logged in and not on an auth page */}
            {token && !isAuthPage && <Navbar />}

            {/* Main content area - takes up remaining vertical space */}
            <main className="flex-grow">
                {/* Define application routes */}
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected routes - require authentication */}
                    <Route path="/home" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/watchlist" element={
                        <ProtectedRoute>
                            <Watchlist />
                        </ProtectedRoute>
                    } />
                    <Route path="/reviews/:movieId" element={
                        <ProtectedRoute>
                            <Reviews />
                        </ProtectedRoute>
                    } />
                    <Route path="/reviews/me" element={
                        <ProtectedRoute>
                            <MyReviews />
                        </ProtectedRoute>
                    } />
                    <Route path="/search" element={
                        <ProtectedRoute>
                            <MovieSearch />
                        </ProtectedRoute>}
                    />
                </Routes>
            </main>
        </div>
    );
}

// Root component setting up the Router
function App() {
    return (
        <Router>
            <AppWrapper />
        </Router>
    );
}

export default App;