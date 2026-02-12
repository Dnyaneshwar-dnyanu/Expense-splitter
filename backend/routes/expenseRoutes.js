const express = require('express');
const router = express();
const groupModel = require('./../models/Group');
const expenseModel = require('./../models/Expense');
const { validateUser } = require('./../middleware/validateUser');

router.post('/:groupID/addExpense', validateUser, async (req, res) => {
    console.log("Add expense!");
    
    let { spentFor, paidBy, totalExpense, participants } = req.body;
    let groupID = req.params.groupID;

    let group = await groupModel.findOne({ _id: groupID });

    const expense = await expenseModel.create({
        spentFor,
        totalExpense,
        paidBy,
        participants
    });

    group.totalGroupExpense += expense.totalExpense;
    group.expenses.push(expense._id);
    await group.save();

    res.send({ success: true, message: "Expense added successfully!" });
});

module.exports = router;