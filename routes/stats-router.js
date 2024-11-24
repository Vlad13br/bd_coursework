const express = require("express");
const router = express.Router();
const StatsController = require("../controllers/stats-controller");
const { isAdmin} = require("../middlewares/auth");


router.get("/users/:id",isAdmin, StatsController.getAllUsers);

router.get("/newusers/:id",isAdmin, StatsController.getNewUsers);

router.get("/valuableusers/:id",isAdmin, StatsController.getTopEarningUsers);

router.get("/products/:id",isAdmin, StatsController.getTopSellingProducts);

router.get("/stock/:id",isAdmin, StatsController.getProductStock);

router.patch('/stock/:id',isAdmin, StatsController.setProductStock)

router.get("/orders/:id",isAdmin, StatsController.getUncompletedOrders);

router.patch("/orders/:id",isAdmin, StatsController.updateOrderStatus);

router.delete("/orders", StatsController.deleteOrder);

module.exports = router;
