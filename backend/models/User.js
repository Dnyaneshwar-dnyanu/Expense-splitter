const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    name: String,
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: String,
    password: String,
    phone: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]
});

module.exports = mongoose.model('User', userSchema);