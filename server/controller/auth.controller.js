const Auth = require('../model/auth');

exports.login = async (req, res) => {
    try {
        let answer = await Auth.login(req.body);
        if (answer.token) {
            res.json(answer);
        } else {
            res.status(401).json(answer);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    try {
        let answer = await Auth.register(req.body);
        res.json(answer);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMe = async(req , res) => {
    try {
        let answer = await Auth.getMe(req, res);
        res.json(answer);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
