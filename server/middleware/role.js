const Roles = require('../shared/enum'); 

const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    };
};

module.exports = authorizeRoles;
