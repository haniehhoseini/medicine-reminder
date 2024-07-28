const medicine = require('../model/medicine');

exports.medicine = async (req , res ) =>{
    let answer = await medicine.getMedicine(req.body);
    res.json(answer);
};

exports.searchMedicine = async (req , res ) =>{
    let answer = await medicine.searchMedicine(req.body);
    res.json(answer);
};

exports.getMedicineById = async (req , res ) =>{
    let answer = await medicine.getMedicineById(req.params.id);
    console.log(req.params.id);
    res.json(answer);
};

exports.addMedicine = async (req , res) =>{
    try {
        const message = await medicine.addMedicine(req.body);
        res.status(200).send(message);
    } catch (error) {
        res.status(500).send('Error adding medicine to database');
    }
};

exports.deleteMedicine = async (req , res) =>{
    try {
        const message = await medicine.deleteMedicine(req.params.ATCC_code);
        res.status(200).send(message);
    } catch (error) {
        res.status(500).send('Error deleting medicine from database');
    }
};

exports.updateMedicine = async (req , res) =>{
    try {
        const message = await medicine.updateMedicine(req.params.ATCC_code , req.body);
        res.status(200).send(message);
    } catch (error) {
        res.status(500).send('Error updating medicine in database');
    }
};