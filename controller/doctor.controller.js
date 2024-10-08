const doctor = require('../model/doctor');

exports.doctors = async (req , res ) =>{
    let answer = await doctor.getDoctors(req.body);
    res.json(answer);
};

exports.Doctorspatients = async (req , res ) =>{
    let answer = await doctor.getDoctorspatients(req.body);
    res.json(answer);
};

exports.searchDoctor = async (req , res ) =>{
    let answer = await doctor.searchDoctors(req.body);
    res.json(answer);
};

exports.getDoctorById = async (req , res ) =>{
    let answer = await doctor.getDoctorById(req.params.id);
    console.log(req.params.id);
    res.json(answer);
};