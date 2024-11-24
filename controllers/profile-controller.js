const pool = require("../db");

class UserController {
  async getUserInfoAndOrders(req, res) {
    try {
      const { id } = req.params;

      const userQuery = `
            SELECT user_id, name, surname, email, address, phone, role, created_at, updated_at
            FROM users
            WHERE user_id = $1;
        `;
      const userResult = await pool.query(userQuery, [id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const ordersQuery = `
            SELECT o.order_id, o.order_start, o.order_end, o.payment_method, o.shipping_status,
                   oi.quantity, oi.price, w.product_name, w.image_url
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN watchers w ON oi.watcher_id = w.watcher_id
            WHERE o.user_id = $1
            ORDER BY o.order_start DESC;
        `;
      const ordersResult = await pool.query(ordersQuery, [id]);

      const orders = {};

      ordersResult.rows.forEach((order) => {
        if (!orders[order.order_id]) {
          orders[order.order_id] = {
            order_id: order.order_id,
            order_start: order.order_start,
            order_end: order.order_end,
            payment_method: order.payment_method,
            shipping_status: order.shipping_status,
            items: [],
            total: 0,
          };
        }

        orders[order.order_id].items.push({
          product_name: order.product_name,
          quantity: order.quantity,
          price: order.price,
          image_url: order.image_url,
        });

        orders[order.order_id].total += order.quantity * order.price;
      });

      const ordersArray = Object.values(orders);

      res.status(200).json({
        message: "User information and orders retrieved successfully",
        data: {
          user: userResult.rows[0],
          orders: ordersArray,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, surname, email, address, phone } = req.body;

      const query = `
                UPDATE users
                SET name = COALESCE($1, name),
                    surname = COALESCE($2, surname),
                    email = COALESCE($3, email),
                    address = COALESCE($4, address),
                    phone = COALESCE($5, phone),
                    updated_at = NOW()
                WHERE user_id = $6
                RETURNING user_id, name, surname, email, address, phone, role, updated_at;
            `;

      const values = [name, surname, email, address, phone, id];
      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "User profile updated successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async createOrder(req, res) {
    try {
      const { id } = req.params;
      const { items, payment_method } = req.body;
console.log(items);
      const orderResult = await pool.query(
          `INSERT INTO orders (user_id, payment_method) VALUES ($1, $2) RETURNING order_id`,
          [id, payment_method]
      );
      const orderId = orderResult.rows[0].order_id;

      const orderItemsQueries = items.map((item) =>
          pool.query(
              `INSERT INTO order_items (order_id, watcher_id, quantity, price) VALUES ($1, $2, $3, $4)`,
              [orderId, item.watcher_id, item.quantity, item.price]
          )
      );
      await Promise.all(orderItemsQueries);

      res.status(201).json({ message: "Order created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create order" });
    }
  }
}

module.exports = new UserController();
