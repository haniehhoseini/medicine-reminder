const medicine = require('../model/medicine');

exports.medicine = async (req , res ) =>{
    let answer = await medicine.getMedicine(req.params.page);
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
        if (error.message === 'دارو یافت نشد') {
            res.status(404).send('دارو یافت نشد');
        } else if (error.message === 'اطلاعات این دارو یافت نشد لطفا بعدا جستجو کنید') {
            res.status(500).send('اطلاعات این دارو یافت نشد لطفا بعدا جستجو کنید');
        } else {
            res.status(500).send('خطای سرور');
        }
    }
};


exports.addMedicine = async (req , res) =>{
    try {
        const message = await medicine.addMedicine(req.body);
        console.log(req.body);
        res.status(200).send(message);
    } catch (error) {
        res.status(500).send('دارو ثبت نشد');
    }
};

exports.deleteMedicine = async (req , res) =>{
    try {
        const message = await medicine.deleteMedicine(req.body);
        res.status(200).send(message);
    } catch (error) {
        res.status(500).send('دارو پاک نشد');
    }
};

exports.updateMedicine = async (req , res) =>{
    try {
        const message = await medicine.updateMedicine(req.params.ATCC_code , req.body);
        res.status(200).send(message);
    } catch (error) {
        res.status(500).send('دارو اپدیت نشد');
    }
};

exports.getImageUrls = async (req, res) => {
    const { ATCC_code } = req.params;
    console.log(ATCC_code);

    try {
        const imageUrls = await medicine.getImageUrls(ATCC_code);
        res.status(200).json(imageUrls);
    } catch (error) {
        res.status(500).send('عکس دارو دریافت نشد');
    }
};

exports.getMedicineByCompanyID = async (req, res) => {
    const { company_id } = req.params;

    try {
        const medicineList = await medicine.getMedicineByCompanyID(company_id);
        res.status(200).json(medicineList);
    } catch (error) {
        res.status(500).send('داروهای این شرکت با موفقیت دریافت نشد');
    }
};