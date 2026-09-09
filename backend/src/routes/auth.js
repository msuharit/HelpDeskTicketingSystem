const express = require("express"); // makes api routes
const bcrypt = require("bcryptjs"); // hashes passwords
const jwt = require("jsonwebtoken"); // makes login tokens to give to users
const db = require("../db"); // connects to sqlite

const router = express.Router(); // groups endpoints to authentication


// receives json and checks if email if so turns into email into user in sqlite db
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: "A user with that email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db
      .prepare(`
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
      `)
      .run(name.trim(), normalizedEmail, passwordHash);

    const newUser = db
      .prepare(`
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    return res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Unable to register user",
    });
  }
});
// receives email and password and checks if password in sqlite database if so gives login token jwt(jsonwebtoken)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db
      .prepare(`
        SELECT id, name, email, password_hash, role
        FROM users
        WHERE email = ?
      `)
      .get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in",
    });
  }
});

module.exports = router;