import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { timeAgo } from '../utils/date'; 

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null); // ID of the review being edited
    const [editFormData, setEditFormData] = useState({ rating: '', comment: '' }); // State for form data

    // Memoize token retrieval
    const getToken = useCallback(() => localStorage.getItem('token'), []);

    // Fetches the user's reviews from the API
    const fetchUserReviews = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = getToken();
        if (!token) {
            setError("Authentication required. Please log in.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/reviews/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Sort reviews by most recent first
            const sortedReviews = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setReviews(sortedReviews);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(err.response?.data?.message || err.message || 'Could not fetch reviews.');
        } finally {
            setLoading(false);
        }
    }, [getToken]); // Dependency on getToken

    // Fetch reviews on component mount
    useEffect(() => {
        fetchUserReviews();
    }, [fetchUserReviews]); // Dependency on fetchUserReviews

    // Initiates the editing mode for a specific review
    const startEdit = (review) => {
        setEditingId(review.id);
        setEditFormData({
            rating: review.rating,
            comment: review.comment || '', // Handle null comments
        });
    };

    // Cancels the editing mode and resets form state
    const cancelEdit = () => {
        setEditingId(null);
        setEditFormData({ rating: '', comment: '' }); // Reset form data
    };

    // Handles changes in the edit form inputs
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Submits the updated review data to the API
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingId) return;

        const token = getToken();
        if (!token) {
            alert("Authentication error. Please log in again.");
            return;
        }

        try {
            // Send PUT request with updated data
            const { data: updatedReview } = await axios.put(
                `http://localhost:5000/reviews/${editingId}`,
                {
                    rating: Number(editFormData.rating), // Ensure rating is a number
                    comment: editFormData.comment,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update the reviews state with the updated review
            setReviews(prevReviews =>
                prevReviews.map(r => (r.id === editingId ? { ...r, ...updatedReview } : r))
            );

            cancelEdit(); // Exit editing mode on success
        } catch (err) {
            console.error("Error updating review:", err);
            alert(err.response?.data?.message || err.message || 'Failed to update review.');
        }
    };

    // Deletes a review after confirmation
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        const token = getToken();
        if (!token) {
            alert("Authentication error. Please log in again.");
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Remove the deleted review from state
            setReviews(prevReviews => prevReviews.filter(r => r.id !== id));
        } catch (err) {
            console.error("Error deleting review:", err);
            alert(err.response?.data?.message || err.message || 'Failed to delete review.');
        }
    };

    // --- Render Logic ---

    // Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]">
                <p className="text-xl text-gray-400 animate-pulse">Loading your reviews...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-theme(space.16))]">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center max-w-md">
                    <h2 className="text-xl font-semibold mb-3 text-red-400">Error Loading Reviews</h2>
                    <p className="text-gray-300">{error}</p>
                    <button
                        onClick={fetchUserReviews}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

     // Empty State
     if (reviews.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-theme(space.16))] text-center px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.563.563 0 01.329.89l-4.46 3.232a.563.563 0 00-.182.557l1.634 5.03a.563.563 0 01-.83.61l-4.46-3.233a.563.563 0 00-.656 0l-4.46 3.233a.563.563 0 01-.83-.61l1.634-5.03a.563.563 0 00-.182-.557l-4.46-3.232a.563.563 0 01.329-.89h5.518a.563.563 0 00.475-.31L11.48 3.5z" />
                </svg>
                <h2 className="text-2xl font-semibold text-white mb-2">No Reviews Yet</h2>
                <p className="text-gray-400 max-w-md">You haven't reviewed any movies. Find a movie and share your thoughts!</p>
            </div>
        );
    }


    // Main Reviews Display
    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Reviews</h1>
            {/* Grid layout for review cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
                        {/* Movie Poster Section - Centered image within aspect ratio container */}
                        <div className="w-full aspect-[2/3] bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden"> 
                            <img
                                src={review.Movie.poster}
                                alt={`${review.Movie.title} Poster`}
                                className="object-contain max-h-full max-w-full" /* Image scales down to fit */
                                loading="lazy" /* Add lazy loading for performance */
                                onError={(e) => {
                                    // Hide broken image and container can show fallback bg or placeholder
                                    e.target.style.visibility = 'hidden'; // Hide image but keep space
                                }}
                            />
                        </div>

                        {/* Content Section (Handles View and Edit) */}
                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold text-white mb-2">{review.Movie.title} ({review.Movie.year})</h3>

                            {/* Conditional Rendering: Edit Form or View Details */}
                            {editingId === review.id ? (
                                // --- Edit Form ---
                                <form onSubmit={handleUpdate} className="space-y-4 flex flex-col flex-grow">
                                    {/* Rating Input */}
                                    <div>
                                        <label htmlFor={`rating-${review.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                                            Rating (1–10)
                                        </label>
                                        <input
                                            type="number"
                                            id={`rating-${review.id}`}
                                            name="rating"
                                            min="1"
                                            max="10"
                                            step="0.5"
                                            value={editFormData.rating}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    {/* Comment Input */}
                                    <div className="flex-grow">
                                        <label htmlFor={`comment-${review.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                                            Comment (optional)
                                        </label>
                                        <textarea
                                            id={`comment-${review.id}`}
                                            name="comment"
                                            value={editFormData.comment}
                                            onChange={handleEditFormChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none" // Added resize-none
                                        />
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                                        >
                                            Update Review
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // --- View Details ---
                                <div className="flex flex-col flex-grow">
                                    {/* Rating Display */}
                                    <p className="text-sm text-yellow-400 mb-2">⭐ {review.rating}/10</p>
                                    {/* Comment Display */}
                                    {review.comment ? (
                                        <p className="text-sm text-gray-300 italic mb-3 flex-grow">"{review.comment}"</p>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic mb-3 flex-grow">(No comment provided)</p>
                                    )}
                                     {/* Timestamp and Actions */}
                                    <div className="mt-auto pt-3 border-t border-gray-700 flex justify-between items-center">
                                        <p className="text-xs text-gray-500">
                                            {timeAgo(review.createdAt)}
                                        </p>
                                        <div className="flex gap-3">
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => startEdit(review)}
                                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                                aria-label={`Edit review for ${review.Movie.title}`}
                                            >
                                                Edit
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                                                aria-label={`Delete review for ${review.Movie.title}`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyReviews;