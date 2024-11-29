import React, {useContext, useState} from "react";
import axios from "axios";
import '../styles/admin.css';
import {Link} from "react-router-dom";
import AuthContext from "../components/AuthProvider";

const AdminPage = () => {
    const {auth} = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [productStock, setProductStock] = useState([]);
    const [uncompletedOrders, setUncompletedOrders] = useState([]);

    const [activeTable, setActiveTable] = useState(null); // Стан для вибору таблиці
    const [sortConfig, setSortConfig] = useState({key: '', direction: 'asc'}); // Стан для сортування
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users/${auth.user_id}`, {withCredentials: true});
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchNewUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/newusers/${auth.user_id}`, {withCredentials: true});
            setNewUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching new users:", error);
        }
    };

    const fetchTopUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/valuableusers/${auth.user_id}`, {withCredentials: true});
            setTopUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching top users:", error);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/products/${auth.user_id}`, {withCredentials: true});
            setTopProducts(response.data.products);
        } catch (error) {
            console.error("Error fetching top products:", error);
        }
    };

    const fetchProductStock = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/stock/${auth.user_id}`, {withCredentials: true});
            setProductStock(response.data.products);
        } catch (error) {
            console.error("Error fetching product stock:", error);
        }
    };

    const fetchUncompletedOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/orders/${auth.user_id}`, {withCredentials: true});
            setUncompletedOrders(response.data.orders);
        } catch (error) {
            console.error("Error fetching uncompleted orders:", error);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`http://localhost:3001/api/orders/${auth.user_id}`, {
                order_id: orderId,
                new_status: newStatus
            }, {withCredentials: true});
            fetchUncompletedOrders(); // Після оновлення замовлення, повторно завантажуємо замовлення
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const handleUpdateProductStock = async (watcherId, newStock) => {
        try {
            await axios.patch(`http://localhost:3001/api/stock/${auth.user_id}`, {
                watcher_id: watcherId,
                stock: newStock
            }, {withCredentials: true});
            fetchProductStock();
        } catch (error) {
            console.error("Error updating product stock:", error);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await axios.delete(`http://localhost:3001/api/orders`, {
                data: {order_id: orderId},
                withCredentials: true
            });
            fetchUncompletedOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const sortData = (data) => {
        const {key, direction} = sortConfig;
        if (!key) return data;

        const sortedData = [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortedData;
    };

    return (
        <div>
            <button onClick={() => {
                setActiveTable('users');
                fetchUsers();
            }}>All Users
            </button>
            <button onClick={() => {
                setActiveTable('newUsers');
                fetchNewUsers();
            }}>New Users (Last Month)
            </button>
            <button onClick={() => {
                setActiveTable('topUsers');
                fetchTopUsers();
            }}>Top Earning Users
            </button>
            <button onClick={() => {
                setActiveTable('topProducts');
                fetchTopProducts();
            }}>Top Selling Products
            </button>
            <button onClick={() => {
                setActiveTable('productStock');
                fetchProductStock();
            }}>Product Stock
            </button>
            <button onClick={() => {
                setActiveTable('uncompletedOrders');
                fetchUncompletedOrders();
            }}>Uncompleted Orders
            </button>
            <Link className="link" to='/addform'>Add watcher</Link>

            {/* Умовне рендеринг таблиць */}
            {activeTable === 'users' && (
                <div>
                    <h2 className='centered'>All Users</h2>
                    <div className="scrollable-table">
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('user_id')}>Id {sortConfig.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('surname')}>Surname {sortConfig.key === 'surname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('email')}>Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('phone')}>Phone {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(users).map((user) => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTable === 'newUsers' && (
                <div>
                    <h2 className='centered'>New Users (Last Month)</h2>
                    <div className="scrollable-table">
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('user_id')}>Id {sortConfig.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('surname')}>Surname {sortConfig.key === 'surname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('email')}>Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(newUsers).map((user) => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.email}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTable === 'topUsers' && (
                <div>
                    <h2 className='centered'>Top Earning Users</h2>
                    <div className="scrollable-table">
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('user_id')}>Id {sortConfig.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('surname')}>Surname {sortConfig.key === 'surname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('total_earnings')}>Total
                                    Earnings {sortConfig.key === 'total_earnings' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(topUsers).map((user) => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.surname}</td>
                                    <td>{user.total_earnings}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTable === 'topProducts' && (
                <div>
                    <h2 className='centered'>Top Selling Products</h2>
                    <div className="scrollable-table">
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('product_name')}>Product
                                    Name {sortConfig.key === 'product_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('total_sold')}>Total sold
                                     {sortConfig.key === 'total_sold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('total_revenue')}>Total
                                    Revenue {sortConfig.key === 'total_revenue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(topProducts).map((product) => (
                                <tr key={product.product_id}>
                                    <td>{product.product_id}</td>
                                    <td>{product.product_name}</td>
                                    <td>{product.quantity_sold}</td>
                                    <td>{product.total_sales}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTable === 'productStock' && (
                <div>
                    <h2 className='centered'>Product Stock</h2>
                    <div className="scrollable-table">
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('watcher_id')}>Watcher
                                    ID {sortConfig.key === 'watcher_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('product_name')}>Product
                                    Name {sortConfig.key === 'product_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('stock')}>Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(productStock).map((product) => (
                                <tr key={product.watcher_id}>
                                    <td>{product.watcher_id}</td>
                                    <td>{product.product_name}</td>
                                    <td>{product.stock}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTable === 'uncompletedOrders' && (
                <div>
                    <h2 className='centered'>Uncompleted Orders</h2>
                    <div className="scrollable-table">
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('order_id')}>Order
                                    ID {sortConfig.key === 'order_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('user_id')}>User
                                    ID {sortConfig.key === 'user_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('product_name')}>Product
                                    Name {sortConfig.key === 'product_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('status')}>Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('order_date')}>Order
                                    Date {sortConfig.key === 'order_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(uncompletedOrders).map((order) => (
                                <tr key={order.order_id}>
                                    <td>{order.order_id}</td>
                                    <td>{order.user_id}</td>
                                    <td>{order.product_name}</td>
                                    <td>{order.status}</td>
                                    <td>{formatDate(order.order_date)}</td>
                                    <td>
                                        <select
                                            onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)}
                                            value={order.status}>
                                            {validStatuses.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleDeleteOrder(order.order_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminPage;
