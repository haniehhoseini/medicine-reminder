const Auth = require('../model/auth');


exports.loginTask = async (req , res ) =>{
   let answer = await Auth.login(req.body);
   res.json(answer);
};

exports.registerTask = async (req , res)=>{
   let answer = await Auth.register(req.body);
   res.json(answer);
};
