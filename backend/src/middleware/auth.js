const jwt = require("jsonwebtoken");



function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    const token = authHeader.split(" ")[1];
    let decoded 

    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
    req.user = decoded;
    next();

}

module.exports = auth;