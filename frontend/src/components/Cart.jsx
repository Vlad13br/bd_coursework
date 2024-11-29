import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from '../styles/cart.module.css';
import AuthContext from "./AuthProvider";

const Cart = () => {
    const { auth } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (Array.isArray(storedCart) && storedCart.every(item => item.name && item.price && item.watcher_id)) {
            // Групуємо товари за watcher_id
            const groupedItems = storedCart.reduce((acc, item) => {
                const existingItem = acc.find(i => i.watcher_id === item.watcher_id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    acc.push(item);
                }
                return acc;
            }, []);
            setCartItems(groupedItems);
        } else {
            setCartItems([]);
            localStorage.removeItem("cart");
        }
    }, []);

    // Оновлення кількості товару
    const updateQuantity = (watcher_id, newQuantity) => {
        if (newQuantity < 1) return; // Перевірка на мінімальну кількість
        const updatedCart = cartItems.map(item =>
            item.watcher_id === watcher_id ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const removeFromCart = (watcher_id) => {
        const updatedCart = cartItems.filter(item => item.watcher_id !== watcher_id);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const handleOrder = async () => {
        if (cartItems.length === 0) {
            setMessage("Ваш кошик порожній.");
            return;
        }

        setIsLoading(true);
        try {
            const orderData = {
                items: cartItems.map((item) => ({
                    watcher_id: item.watcher_id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                payment_method: "card",
            };

            const response = await axios.post(
                `http://localhost:3001/api/orders/${auth.user_id}`,
                orderData,
                { withCredentials: true }
            );

            setCartItems([]);
            localStorage.removeItem("cart");
            setMessage("Ваше замовлення прийнято! Наш менеджер зв’яжеться з вами.");
        } catch (error) {
            console.error("Помилка під час оформлення замовлення:", error);
            setMessage("Не вдалося оформити замовлення. Спробуйте ще раз.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.cartContainer}>
            <h3 className={styles.cartTitle}>Кошик</h3>
            {cartItems.length === 0 ? (
                <p>Кошик порожній.</p>
            ) : (
                <ul className={styles.cartList}>
                    {cartItems.map((item, index) => (
                        <li key={index} className={styles.cartItem}>
                            <img
                                src={item.image}
                                alt={item.name}
                                className={styles.cartItemImage}
                            />
                            <div className={styles.cartItemDetails}>
                                <p>{item.name}</p>
                                <p>{item.price.toFixed(2)} грн</p>
                                <div className={styles.quantityControl}>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => updateQuantity(item.watcher_id, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateQuantity(item.watcher_id, parseInt(e.target.value) || 1)
                                        }
                                        min="1"
                                        className={styles.quantityInput}
                                    />
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => updateQuantity(item.watcher_id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                className={styles.removeBtn}
                                onClick={() => removeFromCart(item.watcher_id)}
                            >
                                Видалити
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {cartItems.length > 0 && (
                <button
                    className={styles.orderBtn}
                    onClick={handleOrder}
                    disabled={isLoading}
                >
                    {isLoading ? "Оформлення..." : "Оформити замовлення"}
                </button>
            )}

            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default Cart;
