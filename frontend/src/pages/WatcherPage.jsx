import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {useParams, useNavigate, Link} from 'react-router-dom';
import  AuthContext  from '../components/AuthProvider'
import '../styles/watcher.css';

const WatcherPage = () => {
    const { watcher_id } = useParams();
    const { auth } = useContext(AuthContext);
    const [watcher, setWatcher] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [formData, setFormData] = useState({
        product_name: "",
        price: "",
        description: "",
        material: "",
        discount: "",
        brand: "",
        stock: 0,
        image_url: ""
    });

    const history = useNavigate();

    useEffect(() => {
        const fetchWatcherData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/watchers/${watcher_id}`);
                setWatcher(response.data.data.watcher);
                setReviews(response.data.data.reviews);
                setFormData({
                    product_name: response.data.data.watcher.product_name || "",
                    price: response.data.data.watcher.price || "",
                    description: response.data.data.watcher.description || "",
                    material: response.data.data.watcher.material || "",
                    discount: response.data.data.watcher.discount || "",
                    brand: response.data.data.watcher.brand || "",
                    stock: response.data.data.watcher.stock || 0,
                    image_url: response.data.data.watcher.image_url || "",
                });
            } catch (err) {
                setError('Не вдалося завантажити дані');
            } finally {
                setLoading(false);
            }
        };

        fetchWatcherData();
    }, [watcher_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value.trim(),
        }));
    };

    const handleUpdateWatcher = async (e) => {
        e.preventDefault();

        // Базова валідація
        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            setError("Ціна повинна бути числовим значенням та більше за 0.");
            return;
        }

        if (formData.discount && (isNaN(formData.discount) || parseFloat(formData.discount) < 0)) {
            setError("Знижка повинна бути числовим значенням та більше або дорівнювати 0.");
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/api/watchers/${watcher_id}`, formData, {withCredentials: true});
            setWatcher(response.data.data);
            setEditing(false);
        } catch (err) {
            setError('Не вдалося оновити товар');
        }
    };


    const handleUpdateDiscount = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(`http://localhost:3001/api/watchers/discount/${watcher_id}`, { discount: formData.discount }, {withCredentials:true});
            setWatcher(response.data.data);
        } catch (err) {
            setError('Не вдалося оновити знижку');
        }
    };


    const handleAddToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const updatedWatcher = {
            watcher_id: watcher.watcher_id,
            name: watcher.product_name,
            price: parseFloat(watcher.price),
            quantity: 1,
            image: watcher.image_url,
        };

        cart.push(updatedWatcher);
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log(cart);

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleDeleteWatcher = async () => {
        const confirmDelete = window.confirm("Ви впевнені, що хочете видалити цей товар?");

        if (!confirmDelete) {
            return;
        }
        try {
            await axios.delete(`http://localhost:3001/api/watchers/${watcher_id}`, { withCredentials: true });
            history("/");
        } catch (err) {
            setError('Не вдалося видалити товар');
        }
    };

    if (loading) {
        return <p>Завантаження...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!watcher) {
        return <p>Спостерігача не знайдено.</p>;
    }

    const discountedPrice = watcher.discount
        ? watcher.price - (watcher.price * (watcher.discount / 100))
        : null;

    return (
        <div className="watcher-page-container">
            <div className="watcher-info-box">
                <h1>{watcher.product_name}</h1>
                <img src={watcher.image_url} alt={watcher.product_name} className="watcher-image"/>
                <p><strong>Опис:</strong> {watcher.description}</p>
                <p><strong>Бренд:</strong> {watcher.brand}</p>
                <p><strong>Матеріал:</strong> {watcher.material}</p>
                <p><strong>Наявність на складі:</strong> {watcher.stock ? 'В наявності' : 'Немає на складі'}</p>

                <div className="price-box">
                    {watcher.discount > 0 ? (
                        <>
                            <p className="price">
                                <span className="original-price">Ціна: {watcher.price} грн</span>
                                <span className="discounted-price">{discountedPrice.toFixed(2)} грн</span>
                            </p>
                        </>
                    ) : (
                        <p className="price"> Ціна: {watcher.price} грн</p>
                    )}
                </div>

                {auth.role === 'admin' && (
                    <>
                        {editing ? (
                            <form onSubmit={handleUpdateWatcher} className="edit-form">
                                <label>
                                    Назва товару:
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={formData.product_name}
                                        onChange={handleChange}
                                        placeholder="Назва товару"
                                    />
                                </label>
                                <label>
                                    Ціна:
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="Ціна"
                                    />
                                </label>
                                <label>
                                    Опис:
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Опис"
                                    />
                                </label>
                                <label>
                                    Матеріал:
                                    <input
                                        type="text"
                                        name="material"
                                        value={formData.material}
                                        onChange={handleChange}
                                        placeholder="Матеріал"
                                    />
                                </label>
                                <label>
                                    Бренд:
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="Бренд"
                                    />
                                </label>
                                <label>
                                    Знижка (%):
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        placeholder="Знижка (%)"
                                    />
                                </label>
                                <label>
                                    Кількість товару:
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="Кількість товару"
                                    />
                                </label>
                                <label>
                                    URL зображення:
                                    <input
                                        type="text"
                                        name="image_url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="URL зображення"
                                    />
                                </label>
                                <button type="submit">Оновити товар</button>
                            </form>

                        ) : (
                            <button onClick={() => setEditing(true)}>Редагувати</button>
                        )}

                        <form onSubmit={handleUpdateDiscount} className="update-discount-form">
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount || ""}
                                onChange={handleChange}
                                placeholder="Знижка (%)"
                            />
                            <button type="submit">Оновити знижку</button>
                        </form>

                        <button onClick={handleDeleteWatcher} className="delete-button">
                            Видалити товар
                        </button>
                    </>
                )}

                {auth?.email && auth?.role !== "admin" && (
                    <>
                    <button onClick={handleAddToCart} className="add-to-cart-button">
                            Додати в кошик
                        </button>
                    </>
                )}
                {isAdded && <div className="cart-notification">Товар додано в кошик!(кошик в фрофілі)</div>}
            </div>

            <div className="reviews-section">
                <h2>Відгуки</h2>
                {reviews.length === 0 ? (
                    <p>Немає відгуків</p>
                ) : (
                    <ul className="reviews-list">
                        {reviews.map((review, index) => {
                            const formattedDate = new Date(review.review_date).toLocaleDateString("uk-UA", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            });

                            return (
                                <li key={index} className="review-card">
                                    <div className="review-header">
                                        <strong>{review.reviewer_name}</strong>
                                        <span className="review-date-rating">
                                            {formattedDate} | Рейтинг: {review.rating} зірок
                                        </span>
                                    </div>
                                    <p>{review.review_text}</p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default WatcherPage;
