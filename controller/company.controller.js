const company = require('../model/company');

exports.company = async (req , res ) =>{
    let answer = await company.getCompany(req.body);
    res.json(answer);
 };

 exports.searchCompanyByName = async (req , res ) =>{
    let answer = await company.searchCompanyByName(req.params.firstname);
    console.log(req.params.firstname)
    res.json(answer);
 };