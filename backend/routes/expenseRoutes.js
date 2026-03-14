const express = require('express');
const router = express();
const groupModel = require('./../models/Group');
const expenseModel = require('./../models/Expense');
const { validateUser } = require('./../middleware/validateUser');

router.post('/:groupID/addExpense', validateUser, async (req, res) => {
    try {
        let { spentFor, paidBy, totalExpense, splitType, participants, customAmounts } = req.body;
        let groupID = req.params.groupID;

        let group = await groupModel.findOne({ _id: groupID });

        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        if (!participants || participants.length === 0) {
            return res.status(400).send({ success: false, message: "Participants list cannot be empty" });
        }

        let updatedParticipants = [];
        if (splitType === 'equal') {
            let sharedAmount = totalExpense / participants.length;

            participants.forEach(id => {
                updatedParticipants.push({ userID: id, sharedAmount });
            });
        }
        else {
            if (!customAmounts) {
                return res.status(400).send({ success: false, message: "Custom amounts are required for unequal splits" });
            }
            participants.forEach(id => {
                if (customAmounts[id] === undefined) {
                    throw new Error(`Missing custom amount for participant ${id}`);
                }
                updatedParticipants.push({ userID: id, sharedAmount: customAmounts[id] });
            });
        }

        const expense = await expenseModel.create({
            spentFor,
            totalExpense,
            paidBy,
            participants: updatedParticipants,
            groupID
        });

        try {
            group.totalGroupExpense += expense.totalExpense;
            group.expenses.push(expense._id);
            await group.save();
        } catch (groupSaveError) {
            // Rollback expense creation if group update fails
            await expenseModel.findByIdAndDelete(expense._id);
            throw new Error("Failed to update group, expense creation rolled back");
        }

        res.send({ success: true, message: "Expense added successfully!" });
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send({ success: false, message: error.message || "Internal Server Error" });
    }
});


router.get('/:userID/:groupID/getInvoice', async (req, res) => {
    try {
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
                    // Only include if NOT settled and NOT the user themselves
                    if (participant.userID && participant.userID._id.toString() !== userID && !participant.isSettled) {

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
                let participantData = expense.participants.find(p => p.userID && p.userID._id.toString() === userID);
                
                // Only include if NOT settled
                if (participantData && !participantData.isSettled) {
                    let share = participantData.sharedAmount;
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
            }
        })

        res.send({ getExpenses, giveExpenses });
    } catch (error) {
        console.error("Error getting invoice:", error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
});

router.post('/:groupID/settle/:withUserID', validateUser, async (req, res) => {
    try {
        const { groupID, withUserID } = req.params;
        const userID = req.user._id;

        // 1. Mark debts where current user paid and 'withUserID' is a participant
        await expenseModel.updateMany(
            { groupID, paidBy: userID, "participants.userID": withUserID },
            { $set: { "participants.$[elem].isSettled": true } },
            { arrayFilters: [{ "elem.userID": withUserID }] }
        );

        // 2. Mark debts where 'withUserID' paid and current user is a participant
        await expenseModel.updateMany(
            { groupID, paidBy: withUserID, "participants.userID": userID },
            { $set: { "participants.$[elem].isSettled": true } },
            { arrayFilters: [{ "elem.userID": userID }] }
        );

        res.send({ success: true, message: "Settled up successfully!" });
    } catch (error) {
        console.error("Error settling up:", error);
        res.status(500).send({ success: false, message: "Failed to settle up" });
    }
});

router.put('/:expenseID/editExpense', validateUser, async (req, res) => {
    try {
        let { spentFor, paidBy, totalExpense, splitType, participants, customAmounts } = req.body;
        let expenseID = req.params.expenseID;

        const oldExpense = await expenseModel.findById(expenseID);
        if (!oldExpense) {
            return res.status(404).send({ success: false, message: "Expense not found" });
        }

        const group = await groupModel.findById(oldExpense.groupID);
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        let updatedParticipants = [];
        if (splitType === 'equal') {
            let sharedAmount = totalExpense / participants.length;
            participants.forEach(id => {
                updatedParticipants.push({ userID: id, sharedAmount });
            });
        }
        else {
            if (!customAmounts) {
                return res.status(400).send({ success: false, message: "Custom amounts are required for unequal splits" });
            }
            participants.forEach(id => {
                updatedParticipants.push({ userID: id, sharedAmount: customAmounts[id] });
            });
        }

        const oldAmount = oldExpense.totalExpense;
        const newAmount = Number(totalExpense);

        oldExpense.spentFor = spentFor;
        oldExpense.totalExpense = newAmount;
        oldExpense.paidBy = paidBy;
        oldExpense.splitType = splitType;
        oldExpense.participants = updatedParticipants;

        await oldExpense.save();

        // Update group total
        group.totalGroupExpense = (group.totalGroupExpense - oldAmount) + newAmount;
        await group.save();

        res.send({ success: true, message: "Expense updated successfully!" });
    } catch (error) {
        console.error("Error editing expense:", error);
        res.status(500).send({ success: false, message: "Failed to edit expense" });
    }
});

router.delete('/:expenseID/deleteExpense', validateUser, async (req, res) => {
    try {
        const expenseID = req.params.expenseID;
        const expense = await expenseModel.findById(expenseID);

        if (!expense) {
            return res.status(404).send({ success: false, message: "Expense not found" });
        }

        const group = await groupModel.findById(expense.groupID);
        if (group) {
            group.totalGroupExpense -= expense.totalExpense;
            group.expenses = group.expenses.filter(id => id.toString() !== expenseID);
            await group.save();
        }

        await expenseModel.findByIdAndDelete(expenseID);

        res.send({ success: true, message: "Expense deleted successfully!" });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).send({ success: false, message: "Failed to delete expense" });
    }
});

router.post('/bulkDelete', validateUser, async (req, res) => {
    try {
        const { expenseIDs } = req.body;

        if (!expenseIDs || !Array.isArray(expenseIDs) || expenseIDs.length === 0) {
            return res.status(400).send({ success: false, message: "No expenses selected" });
        }

        // We need to find the expenses first to know which groups to update
        const expenses = await expenseModel.find({ _id: { $in: expenseIDs } });
        
        if (expenses.length === 0) {
            return res.status(404).send({ success: false, message: "Expenses not found" });
        }

        // Group expenses by their groupID to update group totals
        const groupUpdates = {};
        expenses.forEach(exp => {
            if (!groupUpdates[exp.groupID]) {
                groupUpdates[exp.groupID] = {
                    totalReduction: 0,
                    idsToRemove: []
                };
            }
            groupUpdates[exp.groupID].totalReduction += exp.totalExpense;
            groupUpdates[exp.groupID].idsToRemove.push(exp._id.toString());
        });

        // Apply updates to each group
        for (const [groupID, update] of Object.entries(groupUpdates)) {
            const group = await groupModel.findById(groupID);
            if (group) {
                group.totalGroupExpense -= update.totalReduction;
                group.expenses = group.expenses.filter(id => !update.idsToRemove.includes(id.toString()));
                await group.save();
            }
        }

        // Delete all selected expenses
        await expenseModel.deleteMany({ _id: { $in: expenseIDs } });

        res.send({ success: true, message: `${expenses.length} expenses deleted successfully!` });
    } catch (error) {
        console.error("Error bulk deleting expenses:", error);
        res.status(500).send({ success: false, message: "Failed to delete expenses" });
    }
});

module.exports = router;