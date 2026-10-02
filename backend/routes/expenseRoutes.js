const express = require('express');
const router = express();
const mongoose = require('mongoose');
const groupModel = require('./../models/Group');
const expenseModel = require('./../models/Expense');
const { validateUser } = require('./../middleware/validateUser');
const { simplifyDebts } = require('./../utils/settlementOptimizer');

router.post('/:groupID/addExpense', validateUser, async (req, res) => {
    try {
        let { spentFor, paidBy, totalExpense, splitType, participants, customAmounts, category } = req.body;
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
            category: category || 'Other',
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

router.get('/:groupID/optimizedSettlements', validateUser, async (req, res) => {
    try {
        const { groupID } = req.params;

        const group = await groupModel.findById(groupID).populate('members', 'name email _id');
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        // Verify requesting user is a member of the group
        const isMember = group.members.some(m => m._id.toString() === req.user._id.toString());
        if (!isMember) {
            return res.status(403).send({ success: false, message: "Access denied: You are not a member of this group" });
        }

        const expenses = await expenseModel.find({ groupID })
            .populate('paidBy', 'name email _id')
            .populate('participants.userID', 'name email _id');

        const result = simplifyDebts(expenses, group.members);
        res.send(result);
    } catch (error) {
        console.error("Error optimizing settlements:", error);
        res.status(500).send({ success: false, message: "Failed to calculate optimized settlements" });
    }
});

router.get('/:groupID/analytics', validateUser, async (req, res) => {
    try {
        const { groupID } = req.params;

        const group = await groupModel.findById(groupID).populate('members', 'name email _id');
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        const isMember = group.members.some(m => m._id.toString() === req.user._id.toString());
        if (!isMember) {
            return res.status(403).send({ success: false, message: "Access denied: You are not a member of this group" });
        }

        const groupObjectId = new mongoose.Types.ObjectId(groupID);

        const [aggregationResult] = await expenseModel.aggregate([
            { $match: { groupID: groupObjectId } },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalSpending: { $sum: "$totalExpense" },
                                count: { $sum: 1 },
                                avgExpense: { $avg: "$totalExpense" },
                                maxExpense: { $max: "$totalExpense" }
                            }
                        }
                    ],
                    highestExpense: [
                        { $sort: { totalExpense: -1 } },
                        { $limit: 1 },
                        {
                            $lookup: {
                                from: "users",
                                localField: "paidBy",
                                foreignField: "_id",
                                as: "payer"
                            }
                        },
                        { $unwind: { path: "$payer", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                spentFor: 1,
                                totalExpense: 1,
                                category: { $ifNull: ["$category", "Other"] },
                                addedAt: 1,
                                payerName: { $ifNull: ["$payer.name", "Unknown"] }
                            }
                        }
                    ],
                    byCategory: [
                        {
                            $group: {
                                _id: { $ifNull: ["$category", "Other"] },
                                totalAmount: { $sum: "$totalExpense" },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { totalAmount: -1 } }
                    ],
                    monthlyTrend: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: "%Y-%m", date: "$addedAt" }
                                },
                                totalAmount: { $sum: "$totalExpense" },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    memberPaid: [
                        {
                            $group: {
                                _id: "$paidBy",
                                totalPaid: { $sum: "$totalExpense" },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    memberConsumed: [
                        { $unwind: "$participants" },
                        {
                            $group: {
                                _id: "$participants.userID",
                                totalConsumed: { $sum: "$participants.sharedAmount" },
                                settledAmount: {
                                    $sum: {
                                        $cond: [{ $eq: ["$participants.isSettled", true] }, "$participants.sharedAmount", 0]
                                    }
                                },
                                pendingAmount: {
                                    $sum: {
                                        $cond: [{ $eq: ["$participants.isSettled", false] }, "$participants.sharedAmount", 0]
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]);

        const summaryData = (aggregationResult && aggregationResult.summary && aggregationResult.summary[0]) || {
            totalSpending: 0,
            count: 0,
            avgExpense: 0,
            maxExpense: 0
        };

        const totalSpending = summaryData.totalSpending || 0;
        const totalExpensesCount = summaryData.count || 0;
        const averagePerMember = group.members.length > 0 ? (totalSpending / group.members.length) : 0;

        // Compute percentages for categories
        const categoryBreakdown = ((aggregationResult && aggregationResult.byCategory) || []).map(cat => ({
            category: cat._id,
            totalAmount: Number(cat.totalAmount.toFixed(2)),
            count: cat.count,
            percentage: totalSpending > 0 ? Number(((cat.totalAmount / totalSpending) * 100).toFixed(1)) : 0
        }));

        // Build member contribution lookup
        const paidMap = new Map();
        ((aggregationResult && aggregationResult.memberPaid) || []).forEach(p => {
            if (p._id) paidMap.set(p._id.toString(), p.totalPaid);
        });

        const consumedMap = new Map();
        ((aggregationResult && aggregationResult.memberConsumed) || []).forEach(c => {
            if (c._id) {
                consumedMap.set(c._id.toString(), {
                    totalConsumed: c.totalConsumed,
                    settledAmount: c.settledAmount,
                    pendingAmount: c.pendingAmount
                });
            }
        });

        const memberContributions = group.members.map(member => {
            const mId = member._id.toString();
            const totalPaid = Number((paidMap.get(mId) || 0).toFixed(2));
            const consumedData = consumedMap.get(mId) || { totalConsumed: 0, settledAmount: 0, pendingAmount: 0 };
            const totalConsumed = Number(consumedData.totalConsumed.toFixed(2));
            const netBalance = Number((totalPaid - totalConsumed).toFixed(2));

            return {
                user: {
                    _id: member._id,
                    name: member.name,
                    email: member.email
                },
                totalPaid,
                totalConsumed,
                netBalance,
                settledAmount: Number(consumedData.settledAmount.toFixed(2)),
                pendingAmount: Number(consumedData.pendingAmount.toFixed(2)),
                paidRatio: totalSpending > 0 ? Number(((totalPaid / totalSpending) * 100).toFixed(1)) : 0
            };
        }).sort((a, b) => b.netBalance - a.netBalance);

        // Format monthly trends
        const monthlyTrends = ((aggregationResult && aggregationResult.monthlyTrend) || []).map(m => ({
            month: m._id,
            totalAmount: Number(m.totalAmount.toFixed(2)),
            count: m.count
        }));

        res.send({
            success: true,
            summary: {
                totalSpending: Number(totalSpending.toFixed(2)),
                totalExpensesCount,
                averagePerMember: Number(averagePerMember.toFixed(2)),
                highestExpense: (aggregationResult && aggregationResult.highestExpense && aggregationResult.highestExpense[0]) || null
            },
            categoryBreakdown,
            monthlyTrends,
            memberContributions
        });
    } catch (error) {
        console.error("Error generating analytics:", error);
        res.status(500).send({ success: false, message: "Failed to generate group analytics" });
    }
});

router.post('/:groupID/settle/:withUserID', validateUser, async (req, res) => {
    try {
        const { groupID, withUserID } = req.params;
        const currentUserID = req.user._id.toString();

        const group = await groupModel.findById(groupID);
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        const isAdmin = group.admin.toString() === currentUserID;
        const isMember = group.members.some(m => m.toString() === currentUserID);

        if (!isMember) {
            return res.status(403).send({ success: false, message: "Only group members can settle up" });
        }

        // Allow settling if admin, or if the logged-in user is one of the parties settling
        const targetUserId = withUserID.toString();

        // 1. Settle debts where currentUser paid and targetUser owes
        await expenseModel.updateMany(
            { groupID, paidBy: currentUserID, "participants.userID": targetUserId },
            { $set: { "participants.$[elem].isSettled": true } },
            { arrayFilters: [{ "elem.userID": targetUserId }] }
        );

        // 2. Settle debts where targetUser paid and currentUser owes
        await expenseModel.updateMany(
            { groupID, paidBy: targetUserId, "participants.userID": currentUserID },
            { $set: { "participants.$[elem].isSettled": true } },
            { arrayFilters: [{ "elem.userID": currentUserID }] }
        );

        res.send({ success: true, message: "Settled up successfully!" });
    } catch (error) {
        console.error("Error settling up:", error);
        res.status(500).send({ success: false, message: "Failed to settle up" });
    }
});

router.put('/:expenseID/editExpense', validateUser, async (req, res) => {
    try {
        let { spentFor, paidBy, totalExpense, splitType, participants, customAmounts, category } = req.body;
        let expenseID = req.params.expenseID;

        const oldExpense = await expenseModel.findById(expenseID);
        if (!oldExpense) {
            return res.status(404).send({ success: false, message: "Expense not found" });
        }

        const group = await groupModel.findById(oldExpense.groupID);
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only admin can edit expenses" });
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
        if (category) oldExpense.category = category;
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
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only admin can delete expenses" });
        }

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

        // Check if user is admin of the group (assuming all expenses belong to same group for simplicity in frontend selection)
        // If they belong to multiple groups, we should check each.
        const firstExpense = expenses[0];
        const group = await groupModel.findById(firstExpense.groupID);
        if (!group || group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only admin can perform bulk delete" });
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