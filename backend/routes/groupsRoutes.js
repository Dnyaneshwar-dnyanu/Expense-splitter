const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const userModel = require('../models/User');
const groupModel = require('../models/Group');


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

router.get('/:groupID/getGroup', async (req, res) => {
    try {
        const group = await groupModel.findOne({ _id: req.params.groupID })
                                    .populate('members', 'name email _id')
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

router.post('/:groupID/addMember', async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.send({ success: false, message: 'Invalid Member Email' });
        }

        const group = await groupModel.findOne({ _id: req.params.groupID }).populate('members', 'email');

        const alreadyMember = group.members.some((member) => member.email === user.email );

        if(alreadyMember) {
            return res.send({ success: false, message: "This member is already in the group"});
        }

        group.members.push(user._id);
        await group.save();

        user.groups.push(group._id);
        await user.save();

        res.send({ success: true, message: 'New member added successfully!' });
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).send({ success: false, message: 'Failed to add member' });
    }
});

module.exports = router;