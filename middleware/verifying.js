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
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ error: 'توکن شما منقضی شده است، لطفا یکبار دیگر وارد حساب کاربری خود شوید' });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ error: 'توکن نامعتبر است، لطفا یکبار دیگر وارد حساب کاربری خود شوید' });
            } else {
                return res.status(403).json({ error: 'خطای احراز هویت، لطفا یکبار دیگر وارد حساب کاربری خود شوید' });
            }
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
