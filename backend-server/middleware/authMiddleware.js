const jwt = require('jsonwebtoken');

// 1. Check if user is logged in
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Stores user ID and Role in request
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};

// 2. Check if user has specific permission
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access Denied for role: ${req.user.role}` });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };