const jwt = require('jsonwebtoken');

module.exports =(req, res, next)=>{
    try{
    const decode = jwt.verify(req.body.token, "secret");
    req.userDate = decode;
    next();
    }
    catch(error){
        return res.status(401).json({
            message: "Auth Failed"
        })
    }
    
}