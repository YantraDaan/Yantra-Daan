const { Router } = require('express');
const LearningResourceModel = require('../models/LearningResource');
const UserLearningAssignmentModel = require('../models/UserLearningAssignment');
const UserModel = require('../models/UserModels');
const { auth, requireRole } = require('../middleware/auth');

const router = Router();

// Learning Resources Management

// Get all learning resources with pagination and filters
router.get('/resources', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const resources = await LearningResourceModel.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LearningResourceModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      resources,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    res.status(500).json({ error: 'Failed to fetch learning resources' });
  }
});

// Create new learning resource
router.post('/resources', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      resourceType,
      url,
      duration,
      cost,
      language,
      prerequisites,
      skills,
      tags,
      difficulty,
      targetAudience
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !level || !resourceType || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resource = new LearningResourceModel({
      title,
      description,
      category,
      level,
      resourceType,
      url,
      duration: duration || 'Self-paced',
      cost: cost || 'free',
      language: language || 'English',
      prerequisites: prerequisites || [],
      skills: skills || [],
      tags: tags || [],
      difficulty: difficulty || 'medium',
      targetAudience: targetAudience || 'all',
      createdBy: req.user.id,
      status: 'approved', // Auto-approve admin created resources
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    await resource.save();

    res.status(201).json({
      message: 'Learning resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Error creating learning resource:', error);
    res.status(500).json({ error: 'Failed to create learning resource' });
  }
});

// Update learning resource
router.put('/resources/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const resource = await LearningResourceModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('approvedBy', 'name email');

    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    res.json({
      message: 'Learning resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Error updating learning resource:', error);
    res.status(500).json({ error: 'Failed to update learning resource' });
  }
});

// Delete learning resource
router.delete('/resources/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resource has any assignments
    const hasAssignments = await UserLearningAssignmentModel.exists({ learningResourceId: id });
    if (hasAssignments) {
      return res.status(400).json({ 
        error: 'Cannot delete resource with existing assignments' 
      });
    }

    const resource = await LearningResourceModel.findByIdAndDelete(id);
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    res.json({ message: 'Learning resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning resource:', error);
    res.status(500).json({ error: 'Failed to delete learning resource' });
  }
});

// User Learning Assignments Management

// Get all learning assignments with pagination and filters
router.get('/assignments', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } },
        { 'learningResourceId.title': { $regex: search, $options: 'i' } },
        { assignmentReason: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const assignments = await UserLearningAssignmentModel.find(query)
      .populate('userId', 'name email profession verificationStatus')
      .populate('learningResourceId')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserLearningAssignmentModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      assignments,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching learning assignments:', error);
    res.status(500).json({ error: 'Failed to fetch learning assignments' });
  }
});

// Create new learning assignment
router.post('/assignments', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      userId,
      learningResourceId,
      assignmentReason,
      priority,
      dueDate,
      adminNotes
    } = req.body;

    // Validate required fields
    if (!userId || !learningResourceId || !assignmentReason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if resource exists and is approved
    const resource = await LearningResourceModel.findById(learningResourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Learning resource not found' });
    }

    if (resource.status !== 'approved') {
      return res.status(400).json({ error: 'Learning resource is not approved' });
    }

    // Check if assignment already exists
    const existingAssignment = await UserLearningAssignmentModel.findOne({
      userId,
      learningResourceId
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Assignment already exists for this user and resource' });
    }

    const assignment = new UserLearningAssignmentModel({
      userId,
      learningResourceId,
      assignedBy: req.user.id,
      assignmentReason,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      adminNotes: adminNotes || '',
      status: 'assigned'
    });

    await assignment.save();

    // Populate the response
    await assignment.populate([
      { path: 'userId', select: 'name email profession verificationStatus' },
      { path: 'learningResourceId' },
      { path: 'assignedBy', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Learning assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Error creating learning assignment:', error);
    res.status(500).json({ error: 'Failed to create learning assignment' });
  }
});

// Update learning assignment
router.put('/assignments/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assignment = await UserLearningAssignmentModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'name email profession verificationStatus')
     .populate('learningResourceId')
     .populate('assignedBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ error: 'Learning assignment not found' });
    }

    res.json({
      message: 'Learning assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating learning assignment:', error);
    res.status(500).json({ error: 'Failed to update learning assignment' });
  }
});

// Delete learning assignment
router.delete('/assignments/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await UserLearningAssignmentModel.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Learning assignment not found' });
    }

    res.json({ message: 'Learning assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning assignment:', error);
    res.status(500).json({ error: 'Failed to delete learning assignment' });
  }
});

// Get learning statistics
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalResources = await LearningResourceModel.countDocuments();
    const approvedResources = await LearningResourceModel.countDocuments({ status: 'approved' });
    const pendingResources = await LearningResourceModel.countDocuments({ status: 'pending' });
    
    const totalAssignments = await UserLearningAssignmentModel.countDocuments();
    const completedAssignments = await UserLearningAssignmentModel.countDocuments({ status: 'completed' });
    const inProgressAssignments = await UserLearningAssignmentModel.countDocuments({ status: 'in_progress' });
    const assignedAssignments = await UserLearningAssignmentModel.countDocuments({ status: 'assigned' });

    res.json({
      totalResources,
      approvedResources,
      pendingResources,
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      assignedAssignments
    });
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    res.status(500).json({ error: 'Failed to fetch learning statistics' });
  }
});

module.exports = router;
