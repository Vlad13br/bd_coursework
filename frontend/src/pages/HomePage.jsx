import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Filters from '../components/Filters';
import WatchesList from '../components/WatchesList'
import '../styles/homePage.css';

const HomePage = () => {
    const [watches, setWatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({
        sort: 'rating',
        minPrice: '',
        maxPrice: '',
        rating: '',
        discounted: false,
    });

    const queryParams = useMemo(() => ({
        ...filters,
        page: currentPage
    }), [filters, currentPage]);

    const [pendingFilters, setPendingFilters] = useState(filters);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const pageFromUrl = parseInt(searchParams.get('page')) || 1;

        setCurrentPage(pageFromUrl);

        const savedFilters = sessionStorage.getItem('filters');
        if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters);
            setFilters({
                ...parsedFilters,
                sort: parsedFilters.sort || 'rating',
            });
            setPendingFilters({
                ...parsedFilters,
                sort: parsedFilters.sort || 'rating',
            });
        }
    }, [location.search]);

    useEffect(() => {
        fetchWatches();
    }, [queryParams]);

    const fetchWatches = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/watchers', {
                params: { ...filters, page: currentPage },
            });

            if (Array.isArray(response.data.data)) {
                setWatches(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                setError(`Невірний формат даних: ${JSON.stringify(response.data)}`);
            }
        } catch (err) {
            setError('Не вдалося завантажити годинники');
        } finally {
            setLoading(false);
        }
    };

    const handlePendingFilterChange = useCallback((key, value) => {
        setPendingFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const applyFilters = useCallback(() => {
        const filtersChanged = JSON.stringify(filters) !== JSON.stringify(pendingFilters);

        if (filtersChanged) {
            setFilters(pendingFilters);
            sessionStorage.setItem('filters', JSON.stringify(pendingFilters));

            const searchParams = new URLSearchParams();
            searchParams.set('page', 1);
            navigate(`?${searchParams.toString()}`);
        }
    }, [filters, pendingFilters, navigate]);

    const resetFilters = () => {
        const initialFilters = {
            sort: 'rating',
            minPrice: '',
            maxPrice: '',
            rating: '',
            discounted: false,
        };

        // Перевіряємо, чи поточні фільтри відрізняються від значень стандартних
        const filtersChanged = JSON.stringify(filters) !== JSON.stringify(initialFilters);

        if (filtersChanged) {
            setPendingFilters(initialFilters);
            setFilters(initialFilters);

            sessionStorage.removeItem('filters');
            fetchWatches();
        }
    };

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', page);
        navigate(`?${searchParams.toString()}`);
    }, [location.search, navigate]);

    if (loading) {
        return <p>Завантаження годинників...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="page-container">
            <Filters
                filters={filters}
                pendingFilters={pendingFilters}
                handlePendingFilterChange={handlePendingFilterChange}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
            />

            <main className="content">
                <h1 className="album-title">Годинники</h1>
                <WatchesList watches={watches} />
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            disabled={currentPage === index + 1}
                            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomePage;