const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.user_id,
            email: user.email,
            roles: user.roles // Array of role codes
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Expect format: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.roles.includes('ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Access Denied: Admins Only' });
    }
};

module.exports = { generateToken, verifyToken, isAdmin };
