import { NavLink, useNavigate } from "react-router-dom"; 

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication token
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/login');
    };

    const linkClasses = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
            isActive
                ? 'bg-gray-900 text-white' // Active link style
                : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Inactive link style
        }`;

    return (
        <nav className="bg-gray-800 shadow-md border-b border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16"> 

                    {/* Left side:Navigation */}
                    <div className="flex items-center space-x-6"> 
                        {/* App Title */}
                        <NavLink to="/home" className="text-lg font-semibold text-white transition-colors">
                            🎬 Movie App 
                        </NavLink>

                        {/* Navigation Links */}
                        <div className="hidden sm:block sm:ml-6"> 
                            <div className="flex space-x-4">
                                <NavLink to="/home" className={linkClasses}>
                                    Home
                                </NavLink>
                                <NavLink to="/watchlist" className={linkClasses}>
                                    My Watchlist
                                </NavLink>
                                <NavLink to="/reviews/me" className={linkClasses}>
                                    My Reviews
                                </NavLink>
                                <NavLink to="/search" className={linkClasses}>
                                    Search
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Logout Button */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition duration-150 ease-in-out"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;