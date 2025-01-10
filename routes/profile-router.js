const express = require("express");
const router = express.Router();
const UserController = require("../controllers/profile-controller");
const { isAuthenticated} = require("../middlewares/auth");

router.get("/profile/:id",isAuthenticated, UserController.getUserInfoAndOrders);

router.put(
    "/profile/:id",
    isAuthenticated,
    UserController.updateProfile
);

router.post('/orders/:id', isAuthenticated, UserController.createOrder)

module.exports = router;
