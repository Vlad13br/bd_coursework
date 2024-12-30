const express = require("express");
const router = express.Router();
const ReviewsController = require('../controllers/reviews-controller');
const { isAuthenticated } = require("../middlewares/auth");

router.post("/reviews/:id/:order_item_id", isAuthenticated, ReviewsController.createReview);

router.put("/reviews/:id/:review_id", isAuthenticated, ReviewsController.updateReview);

router.delete("/reviews/:id/:review_id", isAuthenticated, ReviewsController.deleteReview);

router.get("/reviews/:id/:order_item_id", isAuthenticated, ReviewsController.getUserReview);

module.exports = router;
