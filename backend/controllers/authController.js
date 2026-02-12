const bcrypt = require('bcrypt');
const cookie = require('cookie');
const { generateToken } = require('../utils/generateToken')
const userModel = require('../models/User');

module.exports.registerUser = async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });

    if (!user) {
        let { name, email, password } = req.body;

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                user = await userModel.create({
                    name, email, password: hash
                });

                user.password = undefined;
                let token = generateToken(user);
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000
                });

                return res.send({ auth: true, user: user });
            });
        });
        return;
    }

    return res.send({ auth: false, message: "This email already registered!" });
}

module.exports.loginUser = async (req, res) => {

    let user = await userModel.findOne({ email: req.body.email });

    if (user) {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (result) {
                user.password = undefined;
                let token = generateToken(user);
                
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
                    maxAge: 24 * 60 * 60 * 1000
                });

                return res.send({ auth: true, user: user });
            }
            return res.send({ auth: false, message: "Invalid password" });
        })
        return;
    }
    return res.send({ auth: false, message: "Invalid email" });
}

module.exports.logoutUser = async (req, res) => {
    res.cookie('token', "");
    res.send({ auth: false });
}