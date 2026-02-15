const mongoose = require('mongoose');

let expenseSchema = mongoose.Schema({
    spentFor: String,
    totalExpense: Number,
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    participants: [{
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sharedAmount: Number
    }],
    addedAt: {
        type: Date,
        default: Date.now()
    },
    groupID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }
});

module.exports = mongoose.model('Expense', expenseSchema);