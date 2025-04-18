import { useEffect, useState } from 'react';
import axios from 'axios';
import { timeAgo } from '../utils/date';

function Home() {
    const [reviews, setReviews] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviewsAndWatchlist = async () => {
        setLoading(true); // Start loading
        setError(''); // Reset error on new fetch
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found. Please log in.");
            }   

        // --- Fetch reviews ---
            const reviewRes = await axios.get('http://localhost:5000/reviews/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Sort immediately after fetching
            const sortedReviews = reviewRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReviews(sortedReviews);

        // --- Fetch watchlist ---
        const watchlistRes = await axios.get('http://localhost:5000/watchlist', {
            headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(watchlistRes.data);

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.message || err.message || "Couldn't load your dashboard data. Please try again later.");
        } finally {
            setLoading(false); // Stop loading regardless of success or error
        }
        };

        fetchReviewsAndWatchlist();
    }, []); // Empty dependency array means this runs once on mount

    // --- Derived State (calculated after fetching) ---
    const reviewCount = reviews.length;
    // Slice after sorting is done
    const recentReviews = reviews.slice(0, 2);
    // Calculate top review safely, handle empty array
    const topReview = reviews.length > 0
    ? [...reviews].sort((a, b) => b.rating - a.rating)[0]
    : null;
    // Select random movie from watchlist (if available)
    const randomWatchlistMovie = watchlist.length
    ? watchlist[Math.floor(Math.random() * watchlist.length)]
    : null;

    // --- Render Logic ---

    // Loading State
    if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-300">
        <p className="text-xl animate-pulse">Loading your dashboard...</p>
        {/* Optional: Add a spinner SVG here */}
        </div>
    );
    }

    // Error State
    if (error) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-400 p-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">Oops!</h2>
            <p>{error}</p>
        </div>
        </div>
    );
    }

    // --- Main Content ---
    return (
    // Overall page container with dark theme
    <div className="bg-gray-900 min-h-screen text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12"> 

        {/* Header Section */}
        <header className="text-center">
            <h1 className="text-4xl font-bold text-white mb-3">
            🎬 Welcome Back!
            </h1>
            <p className="text-lg text-gray-400">
            {reviewCount === 0
                ? "Ready to share your thoughts? Let's review a movie!"
                : `You've shared ${reviewCount} review${reviewCount !== 1 ? 's' : ''}. Keep it up!`}
            </p>
        </header>

        {/* Quote Section */}
        <blockquote className="text-center text-gray-500 italic border-l-4 border-gray-700 pl-4">
            “Movies touch our hearts and awaken our vision, and change the way we see things.” – Martin Scorsese
        </blockquote>

        {/* Main Content Grid*/}
        <div className="space-y-10">

            {/* Top Rated Movie Section */}
            {topReview && (
            <section>
                <h2 className="text-2xl font-semibold text-white mb-5">Your Top Rated Film</h2>
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-gray-700 transition duration-200">
                <img
                    src={topReview.Movie.poster}
                    alt={`${topReview.Movie.title} Poster`}
                    className="h-40 w-28 object-cover rounded-md flex-shrink-0"
                    onError={(e) => { e.target.src = '/placeholder-poster.png'; }} // Basic fallback
                />
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white mb-1">{topReview.Movie.title}</h3>
                    <p className="text-yellow-400 mb-2">⭐ {topReview.rating}/10</p>
                    {topReview.comment && (
                    <p className="text-sm text-gray-400 italic bg-gray-700/50 p-3 rounded">"{topReview.comment}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">Reviewed {timeAgo(topReview.createdAt)}</p>
                </div>
                </div>
            </section>
            )}

            {/* Recent Reviews Section */}
            {recentReviews.length > 0 && (
            <section>
                <h2 className="text-2xl font-semibold text-white mb-5">Recent Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentReviews.map(({ id, rating, comment, Movie, createdAt }) => (
                    <div key={id} className="bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col hover:shadow-xl transition duration-200 h-full">
                    <div className="flex gap-4 mb-4 items-start">
                        <img
                            src={Movie.poster}
                            alt={`${Movie.title} Poster`}
                            className="h-32 w-20 object-cover rounded flex-shrink-0"
                            onError={(e) => { e.target.src = '/placeholder-poster.png'; }} 
                        />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-lg text-white mb-1">{Movie.title}</h3>
                            <p className="text-sm text-yellow-400 mb-2">⭐ {rating}/10</p>
                        </div>
                    </div>
                        {comment && (
                        <p className="text-sm text-gray-400 italic mb-3 flex-grow">"{comment}"</p> 
                        )}
                        {!comment && <div className="flex-grow"></div>} 
                        <p className="text-xs text-gray-500 text-right mt-auto"> 
                        Posted {timeAgo(createdAt)}
                        </p>
                    </div>
                ))}
                </div>
            </section>
            )}

            {/* Watchlist Suggestion Section */}
            {randomWatchlistMovie && (
            <section>
                <h2 className="text-2xl font-semibold text-white mb-5">Next Up From Your Watchlist?</h2>
                <div className="bg-gradient-to-r from-blue-900 via-gray-800 to-gray-800 rounded-lg shadow-lg p-6 flex items-center gap-6 border border-blue-700/50">
                <img
                    src={randomWatchlistMovie.Movie.poster}
                    alt={`${randomWatchlistMovie.Movie.title} Poster`}
                    className="h-32 w-20 object-cover rounded-md flex-shrink-0"
                    onError={(e) => { e.target.src = '/placeholder-poster.png'; }} 
                />
                <div>
                    <h3 className="text-xl font-bold text-white">{randomWatchlistMovie.Movie.title}</h3>
                    <p className="text-sm text-blue-300 mt-1">Ready for your next movie night!</p>
                </div>
                </div>
            </section>
            )}

            {/* Empty State (if no reviews AND no watchlist suggestion) */}
            {!loading && !error && reviews.length === 0 && !randomWatchlistMovie && (
                <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg">
                    <p className="text-lg text-gray-400">Your dashboard is looking a bit empty!</p>
                    <p className="mt-2 text-gray-500">Add some movies to your watchlist or write your first review to get started.</p>
                </div>
            )}

        </div>
        </div>
    </div>
    );
}

export default Home;