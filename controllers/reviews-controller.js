const pool = require('../db');

class ReviewsController {
    createReview = async (req, res) => {
        const { id, order_item_id } = req.params;
        const { rating, review_text } = req.body;

        try {
            const query = `
                INSERT INTO reviews (rating, review_text, review_date, order_item_id)
                VALUES ($1, $2, NOW(), $3)
                RETURNING *;
            `;
            const values = [rating, review_text, order_item_id];
            const { rows } = await pool.query(query, values);
            res.status(201).json(rows[0]);
        } catch (error) {
            console.error('Помилка при створенні відгуку:', error);
            res.status(500).json({ error: 'Не вдалося створити відгук' });
        }
    };

    updateReview = async (req, res) => {
        const { id, review_id } = req.params;
        const { rating, review_text } = req.body;

        try {
            const query = `
                UPDATE reviews
                SET rating = $1, review_text = $2, review_date = NOW()
                WHERE review_id = $3
                RETURNING *;
            `;
            const values = [rating, review_text, review_id];
            const { rows } = await pool.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Відгук не знайдено' });
            }

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Помилка при оновленні відгуку:', error);
            res.status(500).json({ error: 'Не вдалося оновити відгук' });
        }
    };

    deleteReview = async (req, res) => {
        const { id, review_id } = req.params;

        try {
            const query = `
                DELETE FROM reviews
                WHERE review_id = $1
                RETURNING *;
            `;
            const values = [review_id];
            const { rows } = await pool.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Відгук не знайдено' });
            }

            res.status(200).json({ message: 'Відгук успішно видалено' });
        } catch (error) {
            console.error('Помилка при видаленні відгуку:', error);
            res.status(500).json({ error: 'Не вдалося видалити відгук' });
        }
    };

    getUserReview = async (req, res) => {
        const { id, order_item_id } = req.params;

        try {
            const query = `
                SELECT * 
                FROM reviews
                WHERE order_item_id = $1;
            `;
            const values = [order_item_id];
            const { rows } = await pool.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Відгук для даного елемента замовлення не знайдено' });
            }

            res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Помилка при отриманні відгуку:', error);
            res.status(500).json({ error: 'Не вдалося отримати відгук' });
        }
    };
}

module.exports = new ReviewsController();
