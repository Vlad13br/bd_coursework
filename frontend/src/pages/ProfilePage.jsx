import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import AuthContext from "../components/AuthProvider";
import "../styles/profile.css";
import Cart from "../components/Cart";

const useUserProfile = (userId) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/profile/${userId}`,
                    { withCredentials: true }
                );
                setUserData(response.data.data.user);
            } catch (err) {
                setError("Не вдалося завантажити дані профілю");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchUserInfo();
    }, [userId]);

    return { userData, loading, error };
};

const useUserOrders = (userId) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/orders/${userId}`,
                    { withCredentials: true }
                );
                setOrders(response.data.data.orders);
            } catch (err) {
                setError("Не вдалося завантажити замовлення");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchOrders();
    }, [userId]);

    return { orders, loading, error };
};

const ProfilePage = () => {
    const { auth } = useContext(AuthContext);
    const { userData, loading: userLoading, error: userError } = useUserProfile(auth.user_id);
    const { orders, loading: ordersLoading, error: ordersError } = useUserOrders(auth.user_id);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        name: "",
        surname: "",
        email: "",
        address: "",
        phone: "",
    });

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedData({
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            address: userData.address,
            phone: userData.phone,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `http://localhost:3001/api/profile/${auth.user_id}`,
                editedData,
                { withCredentials: true }
            );
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (userLoading || ordersLoading) return <p>Завантаження...</p>;
    if (userError || ordersError) return <p>{userError || ordersError}</p>;

    return (
        <div className="profile-container">
            <div className="profile-layout">
                <section className="user-info">
                    <h2>Мій профіль</h2>
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <label>
                                Ім’я:
                                <input
                                    type="text"
                                    name="name"
                                    value={editedData.name}
                                    onChange={handleChange}
                                />
                            </label>
                            <label>
                                Прізвище:
                                <input
                                    type="text"
                                    name="surname"
                                    value={editedData.surname}
                                    onChange={handleChange}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={editedData.email}
                                    onChange={handleChange}
                                />
                            </label>
                            <label>
                                Адреса:
                                <input
                                    type="text"
                                    name="address"
                                    value={editedData.address}
                                    onChange={handleChange}
                                />
                            </label>
                            <label>
                                Телефон:
                                <input
                                    type="text"
                                    name="phone"
                                    value={editedData.phone}
                                    onChange={handleChange}
                                />
                            </label>
                            <button type="submit">Зберегти</button>
                            <button type="button" onClick={handleCancel}>
                                Скасувати
                            </button>
                        </form>
                    ) : (
                        <>
                            <p>
                                <strong>Ім’я:</strong> {userData?.name}
                            </p>
                            <p>
                                <strong>Прізвище:</strong> {userData?.surname}
                            </p>
                            <p>
                                <strong>Email:</strong> {userData?.email}
                            </p>
                            <p>
                                <strong>Адреса:</strong> {userData?.address}
                            </p>
                            <p>
                                <strong>Телефон:</strong> {userData?.phone}
                            </p>
                            <button onClick={handleEditClick}>Редагувати</button>
                        </>
                    )}
                </section>

                <Cart />

                <section className="user-orders">
                    <h2>Мої замовлення</h2>
                    {orders.length === 0 ? (
                        <p>У вас немає замовлень.</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={order.order_id} className="order-card">
                                    <h3>Замовлення №{order.order_id}</h3>
                                    <p>
                                        <strong>Дата замовлення:</strong>{" "}
                                        {new Date(order.order_start).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>Метод оплати:</strong> {order.payment_method}
                                    </p>
                                    <p>
                                        <strong>Статус доставки:</strong> {order.shipping_status}
                                    </p>
                                    <div className="order-items">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_name}
                                                    className="order-item-image"
                                                />
                                                <p>
                                                    {item.product_name} (x{item.quantity})
                                                </p>
                                                <p>
                                                    <strong>Ціна:</strong> {item.price * item.quantity} грн
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <p>
                                        <strong>Загальна сума замовлення:</strong>{" "}
                                        {order.total.toFixed(2)} грн
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
