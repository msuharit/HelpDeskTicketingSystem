require("dotenv").config();
require("./db");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/tickets", require("./routes/tickets"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Help Desk API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});