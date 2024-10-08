const Auth = require('../model/auth');

exports.login = async (req, res) => {
    try {
        await Auth.login(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.registerPatient = async (req, res) => {
    try {
        
        await Auth.registerPatient(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'خطای داخلی سرور لطفا بعدا تلاش کنید' });
    }
};

exports.registerDoctor = async (req, res) => {
    try {
        await Auth.registerDoctor(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.registerCompany = async (req, res) => {
    try {
        await Auth.registerCompany(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.registerRelatives = async (req, res) => {
    try {
        await Auth.registerRelatives(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updatePatient = async (req, res) => {
    try {
        await Auth.patientUpdate(req, res);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateDoctor = async (req, res) => {
    try{
        await Auth.doctorUpdate(req, res);
    } catch{
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        await Auth.companyUpdate(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateRelatives = async (req, res) => {
    try {
        await Auth.relativesUpdate(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMe = async(req , res) => {
    try {
        await Auth.getMe(req, res);
        //res.json(answer);
    } catch (message) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

