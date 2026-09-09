const express = require("express"); // makes api routes
const auth = require("../middleware/auth"); // auth from middleware
const db = require("../db"); // connects to sqlite

const router = express.Router();

// post endpoint that determines if tickets are valid then creates them in database
router.post("/", auth, (req, res) => {
    // reads body of json from req and seperates into 4 variables to use
    const { title, description, category, priority } = req.body;

    // if there is no title or description errors out
    if (!title || !description) {
        return res.status(400).json({
            message: "Title and description are required"
        });
    }

    // inserts ticket into database, with values under the run defaulting category and priority if none  given
    const result = db.prepare(`
        INSERT INTO tickets (
            title,
            description,
            category,
            priority,
            created_by
        )
        VALUES (?, ?, ?, ?, ?)
    `).run(
        title,
        description,
        category || "Other",
        priority || "Medium",
        req.user.userId // not taken from body since json could send false info
    );

    // gets the ticket using the last inserted row id
    const ticket = db.prepare(`
        SELECT *
        FROM tickets
        WHERE id = ?
    `).get(result.lastInsertRowid);

    // prints the created ticket
    res.status(201).json({
        message: "Ticket created successfully",
        ticket
    });
});

// exports so server.js can import this.
module.exports = router;