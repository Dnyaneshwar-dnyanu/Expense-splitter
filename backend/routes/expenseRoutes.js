const express = require('express');
const router = express();
const groupModel = require('./../models/Group');
const expenseModel = require('./../models/Expense');
const { validateUser } = require('./../middleware/validateUser');

router.post('/:groupID/addExpense', validateUser, async (req, res) => {
    let { spentFor, paidBy, totalExpense, participants } = req.body;
    let groupID = req.params.groupID;

    let group = await groupModel.findOne({ _id: groupID });

    let sharedAmount = totalExpense / participants.length;
    let updatedParticipants = [];

    participants.forEach(id => {
        updatedParticipants.push({ userID: id, sharedAmount });
    });

    const expense = await expenseModel.create({
        spentFor,
        totalExpense,
        paidBy,
        participants: updatedParticipants,
        groupID
    });

    group.totalGroupExpense += expense.totalExpense;
    group.expenses.push(expense._id);
    await group.save();

    res.send({ success: true, message: "Expense added successfully!" });
});


router.get('/:userID/:groupID/getInvoice', async (req, res) => {
    let { userID, groupID } = req.params;

    let expenses = await expenseModel.find({
        $or: [{ paidBy: userID }, { "participants.userID": userID }],
        groupID
    }).populate({
        path: 'participants.userID',
        select: 'name email _id'
    })
        .populate({
            path: 'paidBy',
            select: 'name email _id'
        });

    let getExpenses = {};
    let giveExpenses = {};

    expenses.forEach(expense => {
        if (expense.paidBy._id.toString() === userID) {
            expense.participants.forEach(participant => {
                if (participant.userID._id.toString() !== userID) {

                    let key = participant.userID._id.toString();

                    if (!getExpenses[key]) {
                        getExpenses[key] = {
                            id: key,
                            name: participant.userID.name,
                            email: participant.userID.email,
                            totalExpense: 0,
                            expenses: []
                        }
                    }

                    getExpenses[key].expenses.push({
                        expenseId: expense._id,
                        spentFor: expense.spentFor,
                        sharedAmount: participant.sharedAmount,
                        date: expense.addedAt
                    })

                    getExpenses[key].totalExpense += parseFloat(participant.sharedAmount);
                }
            })
        }
        else {
            let share = expense.participants.find(p => p.userID._id.toString() === userID)?.sharedAmount;

            let key = expense.paidBy._id.toString();

            if (!giveExpenses[key]) {
                giveExpenses[key] = {
                    id: key,
                    name: expense.paidBy.name,
                    email: expense.paidBy.email,
                    totalExpense: 0,
                    expenses: []
                }
            }

            giveExpenses[key].expenses.push({
                expenseId: expense._id,
                spentFor: expense.spentFor,
                sharedAmount: share,
                date: expense.addedAt
            });

            giveExpenses[key].totalExpense += parseFloat(share);
        }
    })

    res.send({ getExpenses, giveExpenses });
});


module.exports = router;