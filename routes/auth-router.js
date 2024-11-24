const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth-controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
});

module.exports = router;
