const medicine = require('../model/medicine');

exports.medicine = async (req , res ) =>{
    let answer = await medicine.getMedicine(req.body);
    res.json(answer);
};

exports.searchMedicine = async (req , res ) =>{
    let answer = await medicine.searchMedicine(req.body);
    res.json(answer);
};