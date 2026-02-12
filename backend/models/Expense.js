const mongoose = require('mongoose');

let expenseSchema = mongoose.Schema({
    spentFor: String,
    totalExpense: Number,
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    addedAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Expense', expenseSchema);