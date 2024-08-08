const jwt = require('jsonwebtoken');
const secret = require('../config/keys').secretOrKey;


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'ابتدا وارد حساب کاربری خود شوید' });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'لطفا یکبار دیگر وارد حساب کاربری خود شوید' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
