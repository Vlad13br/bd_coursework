import React from 'react';
import { Link } from 'react-router-dom';

const WatchesList = ({ watches }) => {
    if (watches.length === 0) {
        return <p>Годинники не знайдені.</p>;
    }

    return (
        <div className="album-list">
            {watches.map((watch) => {
                const discount = parseFloat(watch.discount);
                const price = parseFloat(watch.price);
                const finalPrice = price * (1 - discount / 100);

                return (
                    <Link key={watch.watcher_id} to={`/watchers/${watch.watcher_id}`} className="album-card">
                        <h2>{watch.product_name}</h2>
                        <img
                            src={watch.image_url}
                            className="album-cover"
                            alt="Watcher page"
                            loading="lazy"
                        />
                        <div className="price-info">
                            {discount > 0 ? (
                                <p className="discounted-price">
                                    Ціна: <span className="original-price">{price} грн</span> {finalPrice.toFixed(2)} грн
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
    );
};

export default WatchesList;
