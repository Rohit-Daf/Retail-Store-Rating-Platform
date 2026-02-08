import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/api';
import { StoreCardSkeleton } from '../components/Skeleton';

const StoreDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratingValue, setRatingValue] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const fetchStoreDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/store`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const stores = response.data.data || [];
            const foundStore = stores.find(s => s.s_id === parseInt(id));

            if (!foundStore) {
                toast.error('Store not found');
                navigate('/stores');
                return;
            }
            setStore(foundStore);
            setRatingValue(foundStore.user_rating || 0);
        } catch (error) {
            console.error("Error fetching store details:", error);
            toast.error('Failed to load store details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreDetails();
    }, [id]);

    const handleSubmitRating = async () => {
        if (ratingValue === 0) {
            toast.warning('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            await api.post('/store/rate',
                { s_id: id, rating: ratingValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Rating submitted!');
            await fetchStoreDetails();
        } catch (error) {
            toast.error('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <StoreCardSkeleton />
            <div className="space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 w-full bg-gray-100 rounded animate-pulse" />)}
                </div>
            </div>
        </div>
    );

    const avgRating = store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : "0.0";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header section with prominent rating */}
            <div className="bg-white border-b border-gray-100 py-12 px-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <button
                            onClick={() => navigate('/stores')}
                            className="text-gray-400 hover:text-indigo-600 mb-4 inline-flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to Stores
                        </button>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{store.name}</h1>
                        <p className="text-gray-500 mt-3 text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {store.address}
                        </p>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center min-w-[180px]">
                        <div className="text-5xl font-bold text-indigo-600 mb-1">{avgRating}</div>
                        <div className="flex justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={`text-xl ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                            ))}
                        </div>
                        <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{store.rating_count || 0} Ratings</div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-12 pb-20">
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 font-poppins">Your Feedback</h3>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">How would you rate your experience with {store.name}?</p>

                    <div className="flex justify-between mb-8 px-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRatingValue(star)}
                                className={`text-4xl transition-all duration-200 hover:scale-125 ${star <= ratingValue ? 'text-yellow-400 drop-shadow-md' : 'text-gray-200'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmitRating}
                        disabled={submitting || ratingValue === 0}
                        className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${ratingValue > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? 'Submitting...' : 'Rate Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreDetails;
