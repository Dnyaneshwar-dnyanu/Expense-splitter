const userModel = require('../models/User');
const jwt = require('jsonwebtoken');

module.exports.validateUser = async (req, res, next) => {

    if (!req.cookies.token) {
        return res.status(401).send({ auth: false });
    }

    let token = req.cookies.token;
    
    try {
        let decoded = jwt.verify(token, process.env.JWT_KEY);
        let user = await userModel.findOne({ _id: decoded._id }).select('-password');
        
        if (!user) {
            return res.status(401).send({ auth: false, message: "User not found" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ auth: false, message: "Invalid or expired token" });
    }
}