import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearchResults }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false); // Local loading state for the search action
    const [error, setError] = useState('');     // Local error state

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) { // Check if query is empty or only whitespace
            setError('Please enter a movie title to search.');
            onSearchResults([]); // Clear previous results if any
            return;
        }

        setLoading(true); // Start loading
        setError('');     // Clear previous errors
        onSearchResults([]); // Clear previous results immediately

        try {
            const apiKey = process.env.REACT_APP_OMDB_API_KEY;
            if (!apiKey) {
                throw new Error("API key not configured.");
            }

            const res = await axios.get(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&type=movie`); // Added type=movie

            if (res.data.Response === "True") {
                onSearchResults(res.data.Search || []); // Send results to parent
            } else {
                // Handle OMDB API errors
                setError(res.data.Error || 'No movies found for your query.');
                onSearchResults([]);
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            setError(error.message || 'Failed to fetch movies. Please check your connection or API key.');
            onSearchResults([]); // Ensure results are cleared on error
        } finally {
            setLoading(false); // Stop loading regardless of outcome
        }
    };

    return (
        // Container for the search bar and potential error message
        <div className="w-full">
            {/* Search form */}
            <form onSubmit={handleSearch} className="flex items-center gap-3"> 
                {/* Input field */}
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                         </svg>
                     </div>
                    <input
                        type="text"
                        placeholder="Search movie titles..."
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Adjusted padding for icon
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (error) setError(''); // Clear error on typing
                        }}
                        aria-label="Search movie titles"
                        disabled={loading} // Disable input while loading
                    />
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    className={`flex-shrink-0 inline-flex items-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-150 ease-in-out ${
                        loading
                            ? 'bg-indigo-800 cursor-not-allowed' // Disabled/loading style
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500' // Active style
                    }`}
                    disabled={loading || !query.trim()} // Disable button if loading or query is empty/whitespace
                >
                    {loading ? (
                         // Loading spinner icon
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                    ) : (
                        'Search'
                    )}
                </button>
            </form>

            {/* Display search error messages */}
            {error && (
                <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
            )}
        </div>
    );
};

export default SearchBar;