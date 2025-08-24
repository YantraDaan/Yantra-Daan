const { Router } = require('express');
const TeamMemberModel = require('../models/TeamMember');

const router = Router();

// Get all active team members (public endpoint)
router.get('/', async (req, res) => {
  try {
    const members = await TeamMemberModel.find({ status: 'active' })
      .select('name role bio')
      .sort({ createdAt: 1 });

    res.json({
      members,
      total: members.length
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

module.exports = router;
