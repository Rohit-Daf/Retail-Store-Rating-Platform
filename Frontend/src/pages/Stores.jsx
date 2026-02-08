import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { StoreCardSkeleton } from '../components/Skeleton';

export default function Stores() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [filterRating, setFilterRating] = useState('all');
    const navigate = useNavigate();

    const fetchStores = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.get('/store', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const storesData = response.data.data || [];
            setStores(storesData);
        } catch (error) {
            console.error("Error fetching stores:", error);
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const filteredAndSortedStores = useMemo(() => {
        let result = stores.filter(store => {
            const matchesSearch =
                store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                store.address?.toLowerCase().includes(searchTerm.toLowerCase());

            const rating = store.rankingScore ?? store.avg_rating ?? 0;
            const matchesRating = filterRating === 'all'
                ? true
                : Math.floor(rating) === parseInt(filterRating);

            return matchesSearch && matchesRating;
        });

        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'rating') {
                const ratingA = a.rankingScore ?? a.avg_rating ?? 0;
                const ratingB = b.rankingScore ?? b.avg_rating ?? 0;
                return ratingB - ratingA;
            }
            return 0;
        });

        return result;
    }, [stores, searchTerm, sortBy, filterRating]);

    const renderStars = (rating) => {
        const rounded = Math.round(parseFloat(rating) || 0);
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-sm ${star <= rounded ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Header Section */}
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight font-poppins">Discover Stores</h1>
                            <p className="text-gray-500 mt-2 text-lg">Browse, evaluate, and share your experiences.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search stores..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                />
                            </div>

                            <select
                                value={filterRating}
                                onChange={(e) => setFilterRating(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
                            >
                                <option value="all">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="rating">Sort by Rating</option>
                            </select>
                        </div>
                    </div>
                </header>

                {/* Grid Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => <StoreCardSkeleton key={i} />)}
                    </div>
                ) : filteredAndSortedStores.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No stores found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">Try adjusting your search or filters to find what you're looking for.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilterRating('all'); }}
                            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-all shadow-lg"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAndSortedStores.map((store) => {
                            const avg = store.rankingScore ?? store.avg_rating ?? 0;
                            return (
                                <div
                                    key={store.s_id}
                                    onClick={() => navigate(`/stores/${store.s_id}`)}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{store.name}</h2>
                                            <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                {avg > 0 ? avg.toFixed(1) : 'New'}
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-sm flex items-start gap-2 mb-6 min-h-[40px] line-clamp-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-gray-300">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                            {store.address}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            {renderStars(avg)}
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {store.rating_count || 0} Reviews
                                            </span>
                                        </div>

                                        <button className="bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white p-2.5 rounded-xl transition-all duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
