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

router.get('/getUser', validateUser, async (req, res) => {
     let user = await userModel.findOne({ _id: req.user._id }).populate( {path: 'groups', select: '_id groupName description members'});

     if (!user) {
          return res.send({success: false});
     }

     // If user has no username, generate one from email (for older accounts)
     if (!user.username) {
          let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          let uniqueUsername = baseUsername;
          let checkUsername = await userModel.findOne({ username: uniqueUsername });
          if (checkUsername) {
               uniqueUsername = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
          }
          user.username = uniqueUsername;
          await user.save();
     }

     user.password = null;
     res.send({success: true, user: user});
});

router.post('/updateUser', validateUser, async (req, res) => {
     try {
          let form = req.body;

          if (form.email && form.email !== req.user.email) {
               let existingUser = await userModel.findOne({ email: form.email });
               if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
                    return res.status(400).send({ success: false, message: "Email already taken" });
               }
          }

          if (form.username && form.username !== req.user.username) {
               let existingUser = await userModel.findOne({ username: form.username });
               if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
                    return res.status(400).send({ success: false, message: "Username already taken" });
               }
          }

          let updatedUser = await userModel.findOneAndUpdate(
               { _id: req.user._id}, 
               {    name: form.name,
                    username: form.username,
                    email: form.email,
                    phone: form.phone,
                    bio: form.bio
               }, { new: true });

          if (updatedUser) {
               return res.send({ success: true, message: "Profile updated successfully!"})
          }

          res.send({ success: false, message: "Failed update profile, try again!"})
     } catch (error) {
          console.error("Error updating user:", error);
          res.status(500).send({ success: false, message: "Internal Server Error" });
     }
});

router.get('/logout', validateUser, logoutUser);

router.get('/searchUsers', validateUser, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.send({ success: true, users: [] });
        }

        // Search for users by username or email, excluding the current user
        const users = await userModel.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                        { name: { $regex: query, $options: 'i' } }
                    ]
                },
                { _id: { $ne: req.user._id } }
            ]
        }).select('name username email _id').limit(10);

        res.send({ success: true, users });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;