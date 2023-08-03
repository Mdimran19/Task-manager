const jwt = require('jsonwebtoken');

module.exports = function  (req,res,next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
      res.status(401).json({message: "unauthorized"})
      return;
    }
    const token = authHeader.split(' ')[1];
    if(!token){
      res.status(401).json({message: "unauthorized"})
      return;
    }else{
    jwt.verify(token,process.env.JWT_SECRET,(err,playload) => {
      if(err){
        res.status(401).json({message: "unauthorized"})
      }else{
        req.user = playload;
        next();
      }
    });
    }
};