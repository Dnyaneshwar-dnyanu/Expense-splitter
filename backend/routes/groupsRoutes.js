const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const userModel = require('../models/User');
const groupModel = require('../models/Group');
const expenseModel = require('../models/Expense');


router.post('/:userID/create_group', validateUser, async (req, res) => {
    try {
        let { groupName, description, members } = req.body;

        let user = await userModel.findOne({ _id: req.params.userID });

        // members are expected to be an array of objects from frontend (or just ids, but let's assume objects with id)
        // We only want to store the ObjectIds in the group document.
        let memberIds = members.map(m => m.id);
        memberIds.unshift(user._id); // Add creator

        let createdGroup = await groupModel.create({
            groupName,
            description,
            admin: user._id,
            members: memberIds
        });

        await Promise.all(memberIds.map(async (memberId) => {
            let u = await userModel.findOne({ _id: memberId });
            if (u) {
                u.groups.push(createdGroup._id);
                await u.save();
            }
        }));

        res.send({ success: true, message: 'Group created successfully!' });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).send({ success: false, message: 'Failed to create group' });
    }
});

router.delete('/:groupID/deleteGroup', validateUser, async (req, res) => {
    try {
        const group = await groupModel.findById(req.params.groupID);
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only admin can delete this group" });
        }

        // Remove group reference from all members
        await userModel.updateMany(
            { _id: { $in: group.members } },
            { $pull: { groups: group._id } }
        );

        // Delete all expenses in this group
        await expenseModel.deleteMany({ groupID: group._id });

        // Delete the group
        await groupModel.findByIdAndDelete(group._id);

        res.send({ success: true, message: "Group deleted successfully!" });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).send({ success: false, message: "Failed to delete group" });
    }
});

router.get('/:groupID/getGroup', async (req, res) => {
    try {
        const group = await groupModel.findOne({ _id: req.params.groupID })
                                    .populate('members', 'name email _id')
                                    .populate('admin', 'name email _id')
                                    .populate({
                                        path: 'expenses',
                                        populate: [{
                                            path: 'paidBy',
                                            select: 'name'
                                        },
                                        {
                                            path: 'participants.userID',
                                            select: 'name'
                                        }, 
                                        ]
                                    });
        if (!group) {
            return res.send({ success: false });
        }
        res.send({ success: true, group: group });
    } catch (error) {
        console.error("Error getting group:", error);
        res.status(500).send({ success: false, message: 'Failed to get group' });
    }
});

router.post('/:groupID/addMember', validateUser, async (req, res) => {
    try {
        let userToAdd = await userModel.findOne({ email: req.body.email });
        if (!userToAdd) {
            return res.send({ success: false, message: 'Invalid Member Email' });
        }

        const group = await groupModel.findOne({ _id: req.params.groupID }).populate('members', 'email');
        if (!group) {
            return res.status(404).send({ success: false, message: "Group not found" });
        }

        // Only admin can add members
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: "Only the admin can add new members" });
        }

        const alreadyMember = group.members.some((member) => member.email === userToAdd.email );

        if(alreadyMember) {
            return res.send({ success: false, message: "This member is already in the group"});
        }

        group.members.push(userToAdd._id);
        await group.save();

        userToAdd.groups.push(group._id);
        await userToAdd.save();

        res.send({ success: true, message: 'New member added successfully!' });
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).send({ success: false, message: 'Failed to add member' });
    }
});

module.exports = router;