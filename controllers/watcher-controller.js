const pool = require("../db");

class WatcherController {
    async createWatcher(req, res) {
        try {
            const {
                product_name,
                price,
                description,
                material,
                discount,
                brand,
                stock,
                image_url,
            } = req.body;

            const {id} = req.params;

            const query = `
        INSERT INTO watchers 
        (product_name, price, description, material, discount, brand, stock, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *;
      `;

            const values = [
                product_name,
                price,
                description,
                material,
                discount,
                brand,
                stock,
                image_url,
            ];

            const result = await pool.query(query, values);

            res.status(201).json({
                message: "Watcher created successfully",
                data: result.rows[0],
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Server error"});
        }
    }

    async getAllWatchers(req, res) {
        try {
            const { sort, minPrice, maxPrice, rating, discounted, page = 1, limit = 10 } = req.query;

            let query = `SELECT * FROM watchers WHERE 1=1`;
            const params = [];
            let countQuery = `SELECT COUNT(*) FROM watchers WHERE 1=1`;
            const countParams = [];

            // Фільтри
            if (minPrice) {
                query += ` AND price >= $${params.length + 1}`;
                params.push(parseFloat(minPrice));
                countQuery += ` AND price >= $${countParams.length + 1}`;
                countParams.push(parseFloat(minPrice));
            }
            if (maxPrice) {
                query += ` AND price <= $${params.length + 1}`;
                params.push(parseFloat(maxPrice));
                countQuery += ` AND price <= $${countParams.length + 1}`;
                countParams.push(parseFloat(maxPrice));
            }
            if (rating) {
                query += ` AND rating >= $${params.length + 1}`;
                params.push(parseFloat(rating));
                countQuery += ` AND rating >= $${countParams.length + 1}`;
                countParams.push(parseFloat(rating));
            }
            if (discounted === "true") {
                query += ` AND discount > 0`;
                countQuery += ` AND discount > 0`;
            }

            // Сортування
            if (sort) {
                if (sort === "price_asc") {
                    query += ` ORDER BY (price * (1 - COALESCE(discount, 0) / 100)) ASC`;
                } else if (sort === "price_desc") {
                    query += ` ORDER BY (price * (1 - COALESCE(discount, 0) / 100)) DESC`;
                } else if (sort === "rating") {
                    query += ` ORDER BY rating DESC NULLS LAST, rating_count DESC`;
                }
            }

            // Пагінація
            const offset = (page - 1) * limit;
            query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(parseInt(limit), parseInt(offset));

            const result = await pool.query(query, params);

            const countResult = await pool.query(countQuery, countParams);
            const totalItems = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalItems / limit);

            res.status(200).json({
                message: "Watchers retrieved successfully",
                data: result.rows,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    }

    async getWatcherById(req, res) {
        try {
            const {id} = req.params;

            const queryWatcher = `SELECT * FROM watchers WHERE watcher_id = $1;`;
            const resultWatcher = await pool.query(queryWatcher, [id]);

            if (resultWatcher.rowCount === 0) {
                return res.status(404).json({error: "Watcher not found"});
            }

            const queryReviews = `
      SELECT r.rating, r.review_text, r.review_date, u.name AS reviewer_name
      FROM reviews r
      JOIN order_items oi ON r.order_item_id = oi.order_item_id
      JOIN orders o ON oi.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      WHERE oi.watcher_id = $1
      ORDER BY r.review_date DESC;
    `;
            const resultReviews = await pool.query(queryReviews, [id]);

            res.status(200).json({
                message: "Watcher and reviews retrieved successfully",
                data: {
                    watcher: resultWatcher.rows[0],
                    reviews: resultReviews.rows,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Server error"});
        }
    }

    async updateWatcher(req, res) {
        try {
            const {id} = req.params;
            const {
                product_name,
                price,
                description,
                material,
                discount,
                brand,
                stock,
                image_url,
            } = req.body;
            console.log(req.body);
            const query = `
        UPDATE watchers
        SET 
          product_name = $1,
          price = $2,
          description = $3,
          material = $4,
          discount = $5,
          brand = $6,
          stock = $7,
          image_url = $8
        WHERE watcher_id = $9
        RETURNING *;
      `;

            const values = [
                product_name,
                price,
                description,
                material,
                discount,
                brand,
                stock,
                image_url,
                id,
            ];

            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({error: "Watcher not found"});
            }

            res.status(200).json({
                message: "Watcher updated successfully",
                data: result.rows[0],
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Server error"});
        }
    }

    async updateDiscount(req, res) {
        try {
            const {id} = req.params;
            const {discount} = req.body;
            const query = `
      UPDATE watchers
      SET 
        discount = $1
      WHERE watcher_id = $2
      RETURNING *;
    `;
            const result = await pool.query(query, [discount, id]);

            if (result.rowCount === 0) {
                return res.status(404).json({error: "Watcher not found"});
            }

            res.status(200).json({
                message: "Watcher updated successfully",
                data: result.rows[0],
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Server error"});
        }
    }

}

module.exports = new WatcherController();