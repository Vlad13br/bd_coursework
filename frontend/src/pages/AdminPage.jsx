import React, {useContext, useState} from "react";
import axios from "axios";
import '../styles/admin.css';
import {Link} from "react-router-dom";
import AuthContext from "../components/AuthProvider";

const AdminPage = () => {
    const { auth } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [productStock, setProductStock] = useState([]);
    const [uncompletedOrders, setUncompletedOrders] = useState([]);

    const [activeTable, setActiveTable] = useState(null);
    const validStatuses = ['pending', 'shipped', 'completed', 'cancelled'];
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/users/${auth.user_id}`, {withCredentials:true});
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchNewUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/newusers/${auth.user_id}`,{withCredentials:true});
            setNewUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching new users:", error);
        }
    };

    const fetchTopUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/valuableusers/${auth.user_id}`,{withCredentials:true});
            setTopUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching top users:", error);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/products/${auth.user_id}`,{withCredentials:true});
            setTopProducts(response.data.products);
        } catch (error) {
            console.error("Error fetching top products:", error);
        }
    };

    const fetchProductStock = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/stock/${auth.user_id}`,{withCredentials:true});
            setProductStock(response.data.products);
        } catch (error) {
            console.error("Error fetching product stock:", error);
        }
    };

    const fetchUncompletedOrders = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/orders/${auth.user_id}`, {withCredentials:true});
            setUncompletedOrders(response.data.orders);
        } catch (error) {
            console.error("Error fetching uncompleted orders:", error);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`http://localhost:3001/api/orders/${auth.user_id}`, { order_id: orderId, new_status: newStatus },{withCredentials:true});
            fetchUncompletedOrders();  // Після оновлення замовлення, повторно завантажуємо замовлення
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const handleUpdateProductStock = async (watcherId, newStock) => {
        try {
            await axios.patch(`http://localhost:3001/api/stock/${auth.user_id}`, { watcher_id: watcherId, stock: newStock }, {withCredentials:true});
            fetchProductStock();
        } catch (error) {
            console.error("Error updating product stock:", error);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await axios.delete(`http://localhost:3001/api/orders`, {
                data: { order_id: orderId },
                withCredentials: true
            });
            fetchUncompletedOrders()
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    }

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
        setSortConfig({ key, direction });
    };

    const sortData = (data) => {
        const { key, direction } = sortConfig;
        if (!key) return data;

        const sortedData = [...data];

        sortedData.sort((a, b) => {
            let aValue, bValue;

            if (key === 'total_revenue') {
                aValue = parseFloat(a[key]);
                bValue = parseFloat(b[key]);
            } else {
                aValue = a[key];
                bValue = b[key];
            }

            if (aValue < bValue) {
                if (direction === 'asc') {
                    return -1; // зростання a перед b
                } else {
                    return 1; // спадання b перед a
                }
            } else if (aValue > bValue) {
                if (direction === 'asc') {
                    return 1; // зростання b перед а
                } else {
                    return -1; // спадання a перед b
                }
            }
            return 0;
        });

        return sortedData;
    };

    return (
        <div>
            <button onClick={() => { setActiveTable('users'); fetchUsers(); }}>All Users</button>
            <button onClick={() => { setActiveTable('newUsers'); fetchNewUsers(); }}>New Users (Last Month)</button>
            <button onClick={() => { setActiveTable('topUsers'); fetchTopUsers(); }}>Top Earning Users</button>
            <button onClick={() => { setActiveTable('topProducts'); fetchTopProducts(); }}>Top Selling Products</button>
            <button onClick={() => { setActiveTable('productStock'); fetchProductStock(); }}>Product Stock</button>
            <button onClick={() => { setActiveTable('uncompletedOrders'); fetchUncompletedOrders(); }}>Uncompleted Orders</button>
<Link className="link" to='/addform'>Add watcher</Link>

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
                                <th onClick={() => handleSort('phone')}>Phone {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(newUsers).map((user) => (
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
                                <th onClick={() => handleSort('email')}>Email  {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('phone')}>Phone. {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('total_spent')}>Total Earnings {sortConfig.key === 'total_spent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                            </tr>
                            </thead>
                        <tbody>
                        {sortData(topUsers).map((user)  => (
                            <tr key={user.user_id}>
                                <td>{user.user_id}</td>
                                <td>{user.name}</td>
                                <td>{user.surname}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.total_spent}</td>
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
                                <tr key={product.watcher_id}>
                                    <td>{product.product_name}</td>
                                    <td>{product.total_sold}</td>
                                    <td>{product.total_revenue}</td>
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
                                <th onClick={() => handleSort('product_name')}>Product
                                    Name {sortConfig.key === 'product_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('stock')}>Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th>Input New Stock</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(productStock).map((product)  => (
                                <tr key={product.watcher_id}>
                                    <td>{product.product_name}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                    <input
                                            type="number"
                                            placeholder="New stock"
                                            onChange={(e) => {
                                                const updatedStock = [...productStock];
                                                const index = updatedStock.findIndex(p => p.watcher_id === product.watcher_id);
                                                updatedStock[index].newStock = e.target.value;
                                                setProductStock(updatedStock);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => handleUpdateProductStock(product.watcher_id, product.newStock)}>Update Stock</button>
                                    </td>
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
                                <th onClick={() => handleSort('order_start')}>Order
                                    Start {sortConfig.key === 'order_start' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('shipping_status')}>Shipping Status
                                    {sortConfig.key === 'shipping_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('name')}>User
                                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('surname')}>User
                                    Surname {sortConfig.key === 'surname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('total_order_value')}>Total order value
                                     {sortConfig.key === 'total_order_value' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th>Update Status</th>
                                <th>Delete</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortData(uncompletedOrders).map((order) => (
                                <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                    <td>{formatDate(order.order_start)}</td>
                                    <td>{order.shipping_status}</td>
                                    <td>{order.name}</td>
                                    <td>{order.surname}</td>
                                    <td>${order.total_order_value}</td>
                                    <td>
                                        <select
                                            value={order.shipping_status}
                                            onChange={(e) => handleUpdateOrderStatus(order.order_id, e.target.value)} // Обробник зміни статусу
                                        >
                                            {validStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDeleteOrder(order.order_id)}
                                            className="delete"
                                        >
                                            Delete
                                        </button>
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
