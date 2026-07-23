const express = require("express");
const auth = require("../middleware/auth"); // auth from middleware
const db = require("../db");

const router = express.Router();

// gets profile requestt, runs auth from middleware, if valid token continues
router.get("/profile", auth, (req, res) => {
    const user = db.prepare(`
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ?
    `).get(req.user.userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json({
        user
    });
});

module.exports = router;