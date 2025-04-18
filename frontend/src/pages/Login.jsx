import React, { useState, useEffect } from 'react'; // useEffect already imported
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    // --- Original State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State for displaying errors
    const [loading, setLoading] = useState(false); // State for loading indicator
    const navigate = useNavigate();

    // --- Original Redirect Logic ---
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/home', { replace: true }); // Use replace to prevent going back to login
        }
    // Intentionally empty dependency array to run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Original handleLogin Logic ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        setError(''); // Clear previous errors
        try {
            const res = await axios.post('http://localhost:5000/auth/login', {
                email,
                password,
            });

            localStorage.setItem('token', res.data.token);
            navigate('/home');
        } catch (err) {
            console.error("Login Error:", err); // Log the error
            setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Check email and password.');
            setLoading(false); // Stop loading on error
        }
         // No finally needed here if navigation happens on success
    };

    // --- Refactored UI ---
    return (
        // Centering container
        <div className="flex items-center justify-center min-h-screen px-4">
            {/* Form Card */}
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
                 {/* Header */}
                 <h2 className="text-2xl font-bold text-center text-white">
                    Log in to your Account
                 </h2>

                 {/* Login Form */}
                 <form className="space-y-5" onSubmit={handleLogin}>
                     {/* Email Input */}
                     <div>
                         <label
                             htmlFor="email"
                             className="block mb-1 text-sm font-medium text-gray-300"
                         >
                             Email address
                         </label>
                         <input
                             id="email"
                             name="email"
                             type="email"
                             autoComplete="email"
                             placeholder="you@example.com"
                             className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             disabled={loading}
                             required
                         />
                     </div>

                     {/* Password Input */}
                     <div>
                         <label
                             htmlFor="password"
                             className="block mb-1 text-sm font-medium text-gray-300"
                         >
                             Password
                         </label>
                         <input
                             id="password"
                             name="password"
                             type="password"
                             autoComplete="current-password"
                             placeholder="••••••••"
                             className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             disabled={loading}
                             required
                         />
                     </div>

                     {/* Optional: Add Forgot Password link here */}
                     {/* <div className="text-sm text-right">
                         <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300">
                             Forgot your password?
                         </a>
                     </div> */}

                     {/* Error Display */}
                     {error && (
                        <p className="text-sm text-red-400 text-center">{error}</p>
                     )}

                     {/* Submit Button */}
                     <div>
                         <button
                             type="submit"
                             disabled={loading}
                             className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                         >
                             {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Log In'
                            )}
                         </button>
                     </div>
                 </form>

                 {/* Link to Signup */}
                 <p className="text-sm text-center text-gray-400">
                     Don't have an account?{' '}
                     <Link
                         to="/signup"
                         className="font-medium text-indigo-400 hover:text-indigo-300"
                     >
                         Sign up
                     </Link>
                 </p>
            </div>
        </div>
    );
};

export default Login;