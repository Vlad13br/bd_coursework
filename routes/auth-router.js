const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth-controller");
const validate = require('../middlewares/validate')
const {registerSchema,loginSchema} = require('../validation/auth-validation')

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);

router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
});

module.exports = router;
