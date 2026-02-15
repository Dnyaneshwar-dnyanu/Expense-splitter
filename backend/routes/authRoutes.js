const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { validateUser } = require('../middleware/validateUser');
const userModel = require('../models/User');
const router = express();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/validateUser', validateUser, (req, res) => {
     res.send({ success: true });
});

router.post('/validateMember', validateUser, async (req, res) => {
     let email = req.body.email;

     let user = await userModel.findOne({ email: email });
     if (!user) {
          return res.send({ success: false, message: "This email is not registered" });
     }

     if (user.email === req.user.email) {
          return res.send({ success: false, message: "Already a member"})
     }
     res.send({ success: true, memberID: user._id, message: "Member added successfully!" });
});

router.get('/getData', validateUser, async (req, res) => {
     let user = await userModel.findOne({ _id: req.user._id }).populate('groups');

     if (!user) {
          return res.send({success: false});
     }

     user.password = null;
     res.send({success: true, user: user});
})

router.get('/logout', validateUser, logoutUser);

module.exports = router;