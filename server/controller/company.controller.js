const company = require('../model/company');

exports.company = async (req , res ) =>{
    let answer = await company.getCompany(req.body);
    res.json(answer);
 };