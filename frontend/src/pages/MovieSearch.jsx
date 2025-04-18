import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar'; 

const MovieSearch = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]); // Search results from SearchBar
    const [watchlistIds, setWatchlistIds] = useState(new Set()); // Use a Set for efficient lookup
    const [loadingWatchlist, setLoadingWatchlist] = useState(true);
    const [errorWatchlist, setErrorWatchlist] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(null); // Track submission state for specific movie IDs

    // Memoized function to get auth token
    const getToken = useCallback(() => localStorage.getItem('token'), []);

    // Fetches the current user's watchlist IDs
    const fetchWatchlist = useCallback(async () => {
        setLoadingWatchlist(true);
        setErrorWatchlist('');
        const token = getToken();
        if (!token) {
            // Handle not logged in state if necessary, maybe disable add button
            setLoadingWatchlist(false);
            return;
        }

        try {
            const res = await axios.get("http://localhost:5000/watchlist", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Store only the imdbIDs in a Set for quick checking
            const ids = new Set(res.data.map(item => item.Movie.imdbID));
            setWatchlistIds(ids);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            setErrorWatchlist('Could not load watchlist status.');
        } finally {
            setLoadingWatchlist(false);
        }
    }, [getToken]);

    // Fetch watchlist on component mount
    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    // Ensures movie exists in DB (or creates it) and then navigates to its review page
    const ensureMovieAndNavigate = async (movie) => {
        setIsSubmitting(movie.imdbID); // Indicate loading for this specific movie
        const token = getToken();
        if (!token) {
            alert("Please log in to view or add reviews.");
            setIsSubmitting(null);
            return;
        }

        try {
            // Ensure movie exists in our backend database
            await axios.post('http://localhost:5000/movies/ensure', {
                imdbID: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                poster: movie.Poster !== 'N/A' ? movie.Poster : null, 
            }, {
                headers: { Authorization: `Bearer ${token}` } 
            });

            // Navigate to the review page using the imdbID
            navigate(`/reviews/${movie.imdbID}`);
        } catch (error) {
            console.error('Failed to ensure movie exists:', error);
            alert(error.response?.data?.message || 'Could not proceed to reviews. Please try again.');
            setIsSubmitting(null); // Reset loading state on error
        }
        // No finally block needed here, only reset on error or success via navigation
    };

    // Adds a movie to the user's watchlist
    const addToWatchlist = async (movie) => {
        setIsSubmitting(movie.imdbID); // Indicate loading for this specific movie
        const token = getToken();
        if (!token) {
            alert("Please log in to add movies to your watchlist.");
            setIsSubmitting(null);
            return;
        }

        try {
            await axios.post('http://localhost:5000/watchlist', {
                imdbID: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                poster: movie.Poster !== 'N/A' ? movie.Poster : null, 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setWatchlistIds(prevIds => new Set(prevIds).add(movie.imdbID));
        } catch (error) {
            console.error('Failed to add to watchlist:', error);
            alert(error.response?.data?.message || "Failed to add movie.");
        } finally {
            setIsSubmitting(null); // Reset loading state
        }
    };

    // --- Render Logic ---

    return (
        // Main container with padding
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Search Movies</h1>

            {/* SearchBar component*/}
            <div className="mb-8 max-w-xl mx-auto">
                <SearchBar onSearchResults={setMovies} />
                {errorWatchlist && <p className="text-xs text-red-400 text-center mt-1">{errorWatchlist}</p>}
            </div>

            {/* Search Results Grid */}
            {movies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie) => {
                        // Check if the movie is in the watchlist using the Set
                        const inWatchlist = watchlistIds.has(movie.imdbID);
                        const currentIsSubmitting = isSubmitting === movie.imdbID;
                        const posterSrc = movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-poster.png'; // Use placeholder if N/A

                        return (
                            <div key={movie.imdbID} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col group">
                                {/* Movie Poster Section - Centered image within aspect ratio container */}
                                <div className="w-full aspect-[2/3] bg-gray-700 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={posterSrc}
                                        alt={`${movie.Title} Poster`}
                                        className="object-contain max-h-full max-w-full"
                                        loading="lazy"
                                        onError={(e) => { e.target.src = '/placeholder-poster.png'; }} // Fallback on error
                                    />
                                </div>

                                {/* Movie Info and Actions Section */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-base text-white mb-1 truncate" title={movie.Title}>
                                        {movie.Title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-3">{movie.Year}</p>

                                    {/* Spacer to push buttons down */}
                                    <div className="mt-auto space-y-2 pt-2">
                                        {/* Add/In Watchlist Button */}
                                        <button
                                            onClick={() => !inWatchlist && !currentIsSubmitting && addToWatchlist(movie)}
                                            disabled={inWatchlist || loadingWatchlist || currentIsSubmitting} // Disable if already in list, loading watchlist, or submitting this movie
                                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out flex items-center justify-center ${
                                                inWatchlist
                                                    ? "bg-gray-600 text-gray-400 cursor-default" // Style for "In Watchlist"
                                                    : loadingWatchlist
                                                        ? "bg-gray-500 text-gray-400 cursor-wait" // Style while watchlist loads
                                                        : currentIsSubmitting
                                                            ? "bg-green-700 text-white opacity-70 cursor-wait" // Style while submitting this movie
                                                            : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500" // Default "Add" style
                                            }`}
                                        >
                                            {/* Button Text Logic */}
                                            {inWatchlist ? (
                                                 <>✓ In Watchlist</>
                                            ) : currentIsSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>+ Add to Watchlist</>
                                            )}
                                        </button>

                                        {/* View/Add Reviews Button */}
                                        <button
                                            onClick={() => !currentIsSubmitting && ensureMovieAndNavigate(movie)}
                                            disabled={currentIsSubmitting} // Disable while any action is submitting for this movie
                                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out flex items-center justify-center ${
                                                 currentIsSubmitting
                                                    ? "bg-gray-700 text-gray-400 cursor-wait"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                                            }`}
                                        >
                                             {currentIsSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Loading...
                                                </>
                                             ) : (
                                                <>View / Review</>
                                             )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Placeholder when no search results are available
                <div className="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-white">Find Your Next Movie</h3>
                    <p className="mt-1 text-sm text-gray-400">
                        Use the search bar above to find movies by title.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MovieSearch;