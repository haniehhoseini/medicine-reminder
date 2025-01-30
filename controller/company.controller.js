const company = require('../model/company');

exports.company = async (req , res ) =>{
    let answer = await company.getCompany(req.body);
    res.json(answer);
 };

 exports.searchCompanyByName = async (req , res) =>{
    let answer = await company.searchCompanyByName(req.body);
    res.json(answer);
 };

 exports.getCompanyById = async (req , res ) =>{
    let answer = await company.getCompanyById(req.params.id);
    res.json(answer);
};