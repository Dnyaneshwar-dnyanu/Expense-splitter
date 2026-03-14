const bcrypt = require('bcrypt');
const cookie = require('cookie');
const { generateToken } = require('../utils/generateToken')
const userModel = require('../models/User');

module.exports.registerUser = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });

        if (!user) {
            let { name, email, password } = req.body;

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

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
        }

        return res.send({ auth: false, message: "This email already registered!" });
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).send({ auth: false, message: "Internal Server Error" });
    }
}

module.exports.loginUser = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (isMatch) {
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
        }
        return res.send({ auth: false, message: "Invalid email" });
    } catch (error) {
        console.error("Error in loginUser:", error);
        return res.status(500).send({ auth: false, message: "Internal Server Error" });
    }
}

module.exports.logoutUser = async (req, res) => {
    res.cookie('token', "");
    res.send({ auth: false });
}