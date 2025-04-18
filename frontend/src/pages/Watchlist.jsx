import React, { useEffect, useState, useCallback } from 'react'; 
import axios from 'axios';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetches the user's watchlist from the API
    const fetchWatchlist = useCallback(async () => { // Wrap in useCallback
        setLoading(true);
        setError(""); // Reset error on fetch
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token not found.");
            }
            const res = await axios.get("http://localhost:5000/watchlist", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Sort watchlist items if needed, e.g., by title or date added
            // const sortedWatchlist = res.data.sort((a, b) => a.Movie.title.localeCompare(b.Movie.title));
            setWatchlist(res.data);
        } catch (err) {
            console.error("Failed to fetch watchlist:", err); // Log error for debugging
            setError(err.response?.data?.message || err.message || "Failed to load watchlist.");
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array for useCallback as it doesn't depend on props/state outside

    // Removes a movie from the watchlist via API call and updates local state
    const removeFromWatchlist = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Authentication token not found.");
            }
            await axios.delete(`http://localhost:5000/watchlist/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Update state by filtering out the removed item
            setWatchlist((prevWatchlist) => prevWatchlist.filter((entry) => entry.id !== id));
        } catch (err) {
            console.error("Failed to remove movie from watchlist:", err); // Log error
            // Display a more user-friendly alert or notification
            alert(err.response?.data?.message || err.message || "Failed to remove movie. Please try again.");
        }
    };

    // Fetch watchlist data when the component mounts
    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]); // Include fetchWatchlist in dependency array

    // Loading state display
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]"> {/* Adjust height calculation based on Navbar height */}
                <p className="text-xl text-gray-400 animate-pulse">Loading watchlist...</p>
            </div>
        );
    }

    // Error state display
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md">
                    <h2 className="text-xl font-semibold mb-3 text-red-400">Error Loading Watchlist</h2>
                    <p className="text-gray-300">{error}</p>
                    <button
                        onClick={fetchWatchlist}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty watchlist state display
    if (watchlist.length === 0) {
        return (
             <div className="flex flex-col justify-center items-center min-h-[calc(100vh-theme(space.16))] text-center px-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m3-3v6" /> 
                 </svg>
                 <h2 className="text-2xl font-semibold text-white mb-2">Your Watchlist is Empty</h2>
                 <p className="text-gray-400 max-w-md">Looks like you haven't added any movies yet. Use the search feature to find movies and add them to your list!</p>
             </div>
         );
     }


    // Main watchlist display
    return (
        // Container for the watchlist content
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>
            {/* Grid layout for watchlist items, responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"> 
                {/* Map over the watchlist array to render each movie card */}
                {watchlist.map(({ id, Movie: movie }) => (
                    // Individual movie card container
                    <div
                        key={id}
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:scale-105" // Added group for hover effects, subtle scale on hover
                    >
                        {/* Movie Poster */}
                        <div className="relative aspect-[2/3]"> 
                            <img
                                src={movie.poster}
                                alt={`${movie.title} Poster`}
                                className="w-full h-full object-cover" // Use object-cover for consistent fill
                                onError={(e) => { e.target.src = '/placeholder-poster.png'; }} // Basic fallback image
                            />
                            {/* Remove button positioned absolutely on hover */}
                            <button
                                onClick={() => removeFromWatchlist(id)}
                                aria-label={`Remove ${movie.title} from watchlist`}
                                className="absolute top-2 right-2 z-10 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Movie Info Section */}
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-semibold text-base text-white mb-1 truncate" title={movie.title}> 
                                {movie.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">{movie.year}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Watchlist;