const Auth = require('../model/auth');

exports.login = async (req, res) => {
    try {
        let answer = await Auth.login(req, res);
        if (answer.token) {
            res.json(answer);
        } else {
            res.status(401).json(answer);
        }
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.registerPatient = async (req, res) => {
    try {
        
        let answer = await Auth.registerPatient(req, res);
        res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'خطای داخلی سرور لطفا بعدا تلاش کنید' });
    }
};

exports.registerDoctor = async (req, res) => {
    try {
        let answer = await Auth.registerDoctor(req, res);
        res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.registerCompany = async (req, res) => {
    try {
        let answer = await Auth.registerCompany(req, res);
        res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.registerRelatives = async (req, res) => {
    try {
        let answer = await Auth.registerRelatives(req, res);
        res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getMe = async(req , res) => {
    try {
        let answer = await Auth.getMe(req, res);
        res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
