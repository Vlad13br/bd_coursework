import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/homePage.css'

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

    const [pendingFilters, setPendingFilters] = useState(filters);

    useEffect(() => {
        const savedFilters = localStorage.getItem('filters');
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
    }, []);

    const fetchWatches = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:3001/api/watchers', {
                params: { ...filters, page: currentPage, limit: 10 },
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

    useEffect(() => {
        fetchWatches();
    }, [filters, currentPage]);

    const handlePendingFilterChange = (key, value) => {
        setPendingFilters((prev) => {
            const updatedFilters = { ...prev, [key]: value };
            localStorage.setItem('filters', JSON.stringify(updatedFilters));
            return updatedFilters;
        });
    };

    const applyFilters = () => {
        setFilters(pendingFilters);
    };

    const resetFilters = () => {
        const initialFilters = {
            sort: 'rating',
            minPrice: '',
            maxPrice: '',
            rating: '',
            discounted: false,
        };

        setPendingFilters(initialFilters);
        setFilters(initialFilters);

        localStorage.removeItem('filters');

        fetchWatches();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return <p>Завантаження годинників...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="page-container">
            <aside className="filters-panel">
                <h2>Фільтри</h2>
                <input
                    type="number"
                    placeholder="Мін. ціна"
                    className="filters-panel-input"
                    value={pendingFilters.minPrice}
                    onChange={(e) => handlePendingFilterChange('minPrice', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Макс. ціна"
                    className="filters-panel-input"
                    value={pendingFilters.maxPrice}
                    onChange={(e) => handlePendingFilterChange('maxPrice', e.target.value)}
                />
                <select
                    className="filters-panel-select"
                    value={pendingFilters.rating}
                    onChange={(e) => handlePendingFilterChange('rating', e.target.value)}
                >
                    <option value="">Рейтинг 0+</option>
                    <option value="3">3+ зірки</option>
                    <option value="4">4+ зірки</option>
                </select>
                <label>
                    <input
                        type="checkbox"
                        className="discounted-input"
                        checked={pendingFilters.discounted}
                        onChange={(e) => handlePendingFilterChange('discounted', e.target.checked)}
                    />
                    Тільки зі знижками
                </label>
                <select
                    className="filters-panel-select"
                    value={pendingFilters.sort}
                    onChange={(e) => handlePendingFilterChange('sort', e.target.value)}
                >
                    <option value="rating">Рейтинг</option>
                    <option value="price_asc">Ціна (зростання)</option>
                    <option value="price_desc">Ціна (спадання)</option>
                </select>
                <button onClick={applyFilters} className="apply-button">Застосувати фільтри</button>
                <button onClick={resetFilters} className="reset-button">Скинути фільтри</button>
            </aside>

            <main className="content">
                <h1 className="album-title">Годинники</h1>
                {watches.length === 0 ? (
                    <p>Годинники не знайдені.</p>
                ) : (
                    <div className="album-list">
                        {watches.map((watch) => {
                            const discount = parseFloat(watch.discount);
                            const price = parseFloat(watch.price);
                            const finalPrice = price * (1 - discount / 100);

                            return (
                                <Link key={watch.watcher_id} to={`/watchers/${watch.watcher_id}`}
                                      className="album-card">
                                    <h2>{watch.product_name}</h2>
                                    <img
                                        src={watch.image_url}
                                        className="album-cover"
                                    />
                                    <div className="price-info">
                                        {discount > 0 ? (
                                            <p className="discounted-price">
                                                Ціна: <span
                                                className="original-price">{price} грн</span> {finalPrice.toFixed(2)} грн
                                            </p>
                                        ) : (
                                            <p className="price">Ціна: {price} грн</p>
                                        )}
                                        <p className="description">{watch.description}</p>
                                        {watch.rating_count > 0 && (
                                            <div className="rating">
                                                <span>Рейтинг: {watch.rating} зірок</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
                <div className="pagination">
                    {Array.from({length: totalPages}, (_, index) => (
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