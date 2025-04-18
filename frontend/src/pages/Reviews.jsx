import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { timeAgo } from '../utils/date'; 

const Reviews = () => {
    const { movieId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [userId, setUserId] = useState(null); 
    const [rating, setRating] = useState(5); 
    const [comment, setComment] = useState(""); 
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hasReviewed, setHasReviewed] = useState(false); 
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    // --- Original Working Logic ---
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            // Reset state on new fetch
            setLoading(true);
            setError('');
            setUserId(null);
            setHasReviewed(false);
            setReviews([]);

            // Use the token fetched useEffect to avoid stale closure issues if token changes
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                setError("Authentication required.");
                setLoading(false);
                return;
            }

            try {
                // Fetch user's reviews to get their ID and check if they reviewed this movie
                const userRes = await axios.get('http://localhost:5000/reviews/me', {
                    headers: { Authorization: `Bearer ${currentToken}` },
                });
                // Safely get userId - assumes /reviews/me returns an array
                const currentUserReview = userRes.data.length > 0 ? userRes.data[0] : null;
                const currentUserId = currentUserReview?.userId; // Use optional chaining
                setUserId(currentUserId); // Store the user ID

                // Fetch all reviews for the specific movie
                const reviewRes = await axios.get(`http://localhost:5000/reviews/${movieId}`, {
                     headers: { Authorization: `Bearer ${currentToken}` } 
                });

                // Determine if the current user has reviewed this movie
                const userHasReviewedThis = reviewRes.data.some(r => r.userId === currentUserId);
                setHasReviewed(userHasReviewedThis);

                // Sort and set the reviews for display
                const sortedReviews = reviewRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setReviews(sortedReviews);

            } catch (err) {
                console.error("Error fetching reviews:", err); // Log the full error
                setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch reviews.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [movieId]);

    // Original handleSubmit logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingForm(true); // Indicate submission start
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            alert("Authentication error. Please log in again.");
            setIsSubmittingForm(false);
            return;
        }
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/reviews/${editingId}`, { rating: Number(rating), comment }, { // Ensure rating is number
                    headers: { Authorization: `Bearer ${currentToken}` },
                });
            } else {
                await axios.post('http://localhost:5000/reviews', { movieId, rating: Number(rating), comment }, { // Ensure rating is number
                    headers: { Authorization: `Bearer ${currentToken}` },
                });
            }
            window.location.reload(); // Keep the reload as per original working code
        } catch (err) {
            console.error("Error submitting review:", err); // Log error
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to submit review.');
            setIsSubmittingForm(false); // Stop submitting indicator on error
        }
        // No finally needed here because of reload
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
             alert("Authentication error. Please log in again.");
             return;
        }
        try {
            await axios.delete(`http://localhost:5000/reviews/${id}`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            // Update UI
            setReviews(prevReviews => prevReviews.filter(r => r.id !== id));
            // If the user deleted their only review, update hasReviewed state
            setHasReviewed(false);
            // If they deleted the one they were editing, cancel edit mode
             if (editingId === id) {
                 setEditingId(null);
                 setRating(5);
                 setComment('');
             }
        } catch (err) {
            console.error("Error deleting review:", err); // Log error
            alert(err.response?.data?.message || err.response?.data?.error || 'Failed to delete review.');
        }
    };

    const startEdit = (review) => {
        setEditingId(review.id);
        setRating(review.rating);
        setComment(review.comment || '');
        // Scroll form into view
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]">
                <p className="text-xl text-gray-400 animate-pulse">Loading reviews...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))] px-4">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md">
                    <h2 className="text-xl font-semibold mb-3 text-red-400">Error Loading Page</h2>
                    <p className="text-gray-300">{error}</p>
                     <button
                        onClick={() => window.location.reload()} // Simple retry: reload page
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Main Content - Applied dark theme styles
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-10 pb-6 border-b border-gray-700">
                Reviews
            </h1>

            {/* Add/Edit Review Form Section - Styled */}
            {(!hasReviewed || editingId) && (
                <div id="review-form" className="mb-10 bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-white mb-5">
                        {editingId ? "Edit Your Review" : "Add Your Review"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Rating Input - Styled */}
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">Rating (1–10)</label>
                            <input
                                type="number" id="rating" name="rating" min="1" max="10" step="0.5"
                                value={rating} onChange={(e) => setRating(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                disabled={isSubmittingForm}
                            />
                        </div>
                        {/* Comment Input - Styled */}
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">Comment (optional)</label>
                            <textarea
                                id="comment" name="comment" rows="4"
                                value={comment} onChange={(e) => setComment(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                                disabled={isSubmittingForm}
                            />
                        </div>
                        {/* Action Buttons - Styled */}
                        <div className="flex justify-end gap-3 pt-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => { // Cancel logic
                                        setEditingId(null);
                                        setRating(5);
                                        setComment("");
                                    }}
                                    disabled={isSubmittingForm}
                                    className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmittingForm}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed"
                            >
                                {isSubmittingForm ? (
                                    <> {/* Simple loading indicator */}
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    editingId ? "Update" : "Submit" // Original button text
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Existing Reviews Section - Styled */}
            <div>
                 <h2 className="text-xl font-semibold text-white mb-5">
                     Community Reviews ({reviews.length})
                 </h2>
                 {/* Condition from original code for empty message */}
                 {reviews.length === 0 && !hasReviewed && (
                    <p className="text-center text-gray-500 italic py-6">
                        No reviews yet. Be the first to leave one!
                    </p>
                 )}
                 {reviews.length > 0 && (
                     <div className="space-y-6">
                        {reviews.map((review) => (
                            // Review Card - Styled
                            <div key={review.id} className="bg-gray-800 p-5 rounded-lg shadow">
                                {/* Review Header - Styled */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-600">
                                            <span className="text-sm font-medium leading-none text-white">{review.User?.username ? review.User.username.charAt(0).toUpperCase() : '?'}</span>
                                        </span>
                                        <span className="text-sm font-medium text-white">{review.User?.username || 'Anonymous'}</span>
                                         {/* Original condition for 'You' badge */}
                                         {review.userId === userId && (
                                             <span className="ml-2 text-xs font-medium bg-indigo-600 text-white px-2 py-0.5 rounded-full">You</span>
                                         )}
                                     </div>
                                     {/* Original condition for Edit/Delete buttons */}
                                     {review.userId === userId && (
                                         <div className="flex gap-3">
                                             <button onClick={() => startEdit(review)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                                             <button onClick={() => handleDelete(review.id)} className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Delete</button>
                                         </div>
                                     )}
                                 </div>
                                {/* Review Body - Styled */}
                                <div>
                                    <p className="text-sm text-yellow-400 mb-2">⭐ {review.rating}/10</p>
                                    {review.comment && (
                                        <p className="text-base text-gray-300 whitespace-pre-wrap">{review.comment}</p>
                                    )}
                                </div>
                                {/* Review Footer - Styled */}
                                <p className="text-xs text-gray-500 mt-3 text-right">
                                     Posted {timeAgo(review.createdAt)}
                                </p>
                            </div>
                         ))}
                     </div>
                 )}
             </div>
        </div>
    );
};

export default Reviews;