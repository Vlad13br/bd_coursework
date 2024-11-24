const pool = require("../db");
const bcrypt = require("bcrypt");

class AuthController {
  async register(req, res) {
    try {
      const { name, surname, email, password, address, phone } = req.body;

      // Перевірка, чи вже існує користувач з таким email
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (result.rows.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Створюємо нового користувача
      const newUser = await pool.query(
          `INSERT INTO users (name, surname, email, password, address, phone)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [name, surname, email, hashedPassword, address, phone]
      );

      const user = newUser.rows[0];

      // Створюємо сесію для нового користувача, зберігаючи всю необхідну інформацію
      req.session.user = {
        user_id: user.user_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        address: user.address,
        phone: user.phone,
        role: user.role,
      };

      res.json({ message: "Registration successful", user: req.session.user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      req.session.user = {
        user_id: user.user_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        address: user.address,
        phone: user.phone,
        role: user.role,
      };


      res.json({ message: "Login successful", user: req.session.user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }

  // Оновлений код для логауту
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log out" });
        }

        // Видаляємо cookie для сесії
        res.clearCookie("connect.sid"); // замініть "connect.sid" на ім'я вашої cookie сесії

        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }

}

module.exports = new AuthController();
