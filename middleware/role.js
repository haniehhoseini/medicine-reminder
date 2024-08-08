const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRole = req.user.role;

        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied' });
        }
    };
};
module.exports = authorizeRoles;