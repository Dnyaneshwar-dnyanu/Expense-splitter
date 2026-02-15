const express = require('express');
const router = express();
const { validateUser } = require('../middleware/validateUser');
const userModel = require('../models/User');
const groupModel = require('../models/Group');


router.post('/:userID/create_group', validateUser, async (req, res) => {
    let { groupName, description, members } = req.body;

    let user = await userModel.findOne({ _id: req.params.userID });

    members.unshift({
        id: user._id,
        name: user.name,
        email: user.email,
    });

    let createdGroup = await groupModel.create({
        groupName,
        description,
        members
    });

    members.forEach(async (member) => {
        let user = await userModel.findOne({ _id: member.id });
        user.groups.push(createdGroup._id);
        await user.save();
    });

    res.send({ success: true, message: 'Group created successfully!' });
});

router.get('/:groupID/getGroup', async (req, res) => {
    const group = await groupModel.findOne({ _id: req.params.groupID })
                                .populate('members')
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
});

router.post('/:groupID/addMember', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return res.send({ success: false, message: 'Invalid Member Email' });
    }

    const group = await groupModel.findOne({ _id: req.params.groupID });

    const alreadyMember = group.members.some((member) => member.email === user.email );

    if(alreadyMember) {
        return res.send({ success: false, message: "This member is already in the group"});
    }

    group.members.push({
        id: user._id,
        name: req.body.name,
        email: user.email,
    });
    await group.save();

    user.groups.push(group._id);
    await user.save();

    res.send({ success: true, message: 'New member added successfully!' });
});

module.exports = router;