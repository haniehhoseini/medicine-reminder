const medicine = require('../model/medicine');

exports.medicine = async (req , res ) =>{
    let answer = await medicine.getMedicine(req.body);
    res.json(answer);
};

exports.searchMedicine = async (req , res ) =>{
    let answer = await medicine.searchMedicine(req.body);
    res.json(answer);
};

exports.getMedicineById = async (req, res) => {
    const { id } = req.params;

    try {
        const drugInfo = await medicine.getMedicineById(id);
        res.status(200).json(drugInfo);
    } catch (error) {
        if (error.message === 'Drug not found') {
            res.status(404).send('Drug not found');
        } else if (error.message === 'Failed to retrieve HTML from Wikipedia') {
            res.status(500).send('Failed to retrieve HTML from Wikipedia');
        } else {
            res.status(500).send('Database error');
        }
    }
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
        const message = await medicine.deleteMedicine(req.body);
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

exports.getImageUrls = async (req, res) => {
    const { ATCC_code } = req.params;
    console.log(ATCC_code);

    try {
        const imageUrls = await medicine.getImageUrls(ATCC_code);
        res.status(200).json(imageUrls);
    } catch (error) {
        res.status(500).send('Error retrieving image URLs');
    }
};