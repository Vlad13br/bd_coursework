const pool = require("../db");

class StatsController {
    async getAllUsers(req, res) {
        try {
            const { id } = req.params;
            const query = 'SELECT user_id, name, surname, email, phone FROM users WHERE role != $1;';
            const result = await pool.query(query, ['admin']);
            res.status(200).json({ users: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getNewUsers(req, res) {
        try {
            const { id } = req.params;
            const query = `
            SELECT user_id, name, surname, email, phone
            FROM users
            WHERE created_at > NOW() - INTERVAL '1 month' AND role != $1;
        `;
            const result = await pool.query(query, ['admin']);
            res.status(200).json({ users: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getTopEarningUsers(req, res) {
        try {
            const { id } = req.params;
            const query = `
      SELECT u.user_id, u.name, u.surname, u.email, u.phone, SUM(oi.price * oi.quantity) AS total_spent
      FROM users u
      JOIN orders o ON u.user_id = o.user_id
      JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY u.user_id
      ORDER BY total_spent DESC
    `;
            const result = await pool.query(query);
            res.status(200).json({ users: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async getTopSellingProducts(req, res) {
        try {
            const { id } = req.params;
            const query = `
            SELECT w.watcher_id, w.product_name, SUM(oi.quantity) AS total_sold, SUM(oi.quantity * oi.price) AS total_revenue
            FROM watchers w
            JOIN order_items oi ON w.watcher_id = oi.watcher_id
            GROUP BY w.watcher_id
            ORDER BY total_sold DESC
        `;
            const result = await pool.query(query);
            res.status(200).json({ products: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

// Кількість товарів на складі
    async getProductStock(req, res) {
        try {
            const { id } = req.params;
            const query = 'SELECT watcher_id, product_name, stock FROM watchers';
            const result = await pool.query(query);
            res.status(200).json({ products: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

// Зміна кількості товарів на складі
    async setProductStock(req, res) {
        try {
            const { id } = req.params;
            const { watcher_id, stock } = req.body;

            if (!watcher_id || stock === undefined) {
                return res.status(400).json({ error: "watcher_id і stock обов'язкові" });
            }

            const query = `
        UPDATE watchers
        SET stock = $1
        WHERE watcher_id = $2
        RETURNING *;
    `;

            const result = await pool.query(query, [stock, watcher_id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Watcher не знайдений" });
            }

            res.status(200).json({
                message: "Кількість товару успішно оновлено",
                watcher: result.rows[0],
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка на сервері' });
        }
    }

    // Не завершені замовлення
    async getUncompletedOrders(req, res) {
        try {
            const { id } = req.params;
            const query = `
            SELECT o.order_id, o.order_start, o.order_end, o.shipping_status, u.name, u.surname, 
                   SUM(oi.quantity * oi.price) AS total_order_value
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.shipping_status != 'completed'
            GROUP BY o.order_id, u.name, u.surname, o.order_start, o.order_end, o.shipping_status
        `;
            const result = await pool.query(query);
            res.status(200).json({ orders: result.rows });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

// Зміна статусу замовлення
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { order_id, new_status } = req.body;

            // Перевірка статусy
            const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(new_status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const query = `
      UPDATE orders 
      SET shipping_status = $1 
      WHERE order_id = $2
      RETURNING *;
    `;
            const result = await pool.query(query, [new_status, order_id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.status(200).json({ message: 'Order status updated', order: result.rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    async deleteOrder(req, res) {
        try {
            const { order_id } = req.body;

            // Видалення відгуків, пов'язаних з товарами в замовленні
            await pool.query('DELETE FROM reviews WHERE order_item_id IN (SELECT order_item_id FROM order_items WHERE order_id = $1)', [order_id]);

            // Видалення товарів в замовленні
            await pool.query('DELETE FROM order_items WHERE order_id = $1', [order_id]);

            // Видалення замовлення
            const result = await pool.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [order_id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.status(200).json({ message: 'Order deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

}

module.exports = new StatsController();
