import React from 'react';

const Filters = ({ filters, pendingFilters, handlePendingFilterChange, applyFilters, resetFilters }) => {
    return (
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
    );
};

export default Filters;
