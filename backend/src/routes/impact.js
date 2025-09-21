const { Router } = require('express');
const ImpactModel = require('../models/Impact');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/impact');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'impact-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// Get all impact stories with pagination and filters
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      category = '',
      featured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { headline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured && featured !== 'all') {
      query.featured = featured === 'true';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const impacts = await ImpactModel.find(query)
      .populate('createdBy', 'name email')
      .populate('publishedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ImpactModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      impacts,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching impact stories:', error);
    res.status(500).json({ error: 'Failed to fetch impact stories' });
  }
});

// Get public impact stories (for frontend display)
router.get('/public', async (req, res) => {
  try {
    const { limit = 6, featured = false } = req.query;
    
    let query = { status: 'published', isActive: true };
    
    if (featured === 'true') {
      query.featured = true;
    }

    const impacts = await ImpactModel.find(query)
      .populate('createdBy', 'name')
      .sort({ priority: -1, publishedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      impacts,
      total: impacts.length
    });
  } catch (error) {
    console.error('Error fetching public impact stories:', error);
    res.status(500).json({ error: 'Failed to fetch impact stories' });
  }
});

// Get single impact story
router.get('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const impact = await ImpactModel.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('publishedBy', 'name email');

    if (!impact) {
      return res.status(404).json({ error: 'Impact story not found' });
    }

    res.json(impact);
  } catch (error) {
    console.error('Error fetching impact story:', error);
    res.status(500).json({ error: 'Failed to fetch impact story' });
  }
});

// Create new impact story
router.post('/', auth, requireRole(['admin']), upload.single('image'), async (req, res) => {
  try {
    const {
      headline,
      description,
      link,
      category,
      tags,
      location,
      metrics,
      featured,
      priority,
      adminNotes
    } = req.body;

    // Validate required fields
    if (!headline || !description || !link) {
      return res.status(400).json({ error: 'Headline, description, and link are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Parse JSON fields
    let parsedTags = [];
    let parsedLocation = {};
    let parsedMetrics = {};

    try {
      if (tags) parsedTags = JSON.parse(tags);
      if (location) parsedLocation = JSON.parse(location);
      if (metrics) parsedMetrics = JSON.parse(metrics);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON format for tags, location, or metrics' });
    }

    const impact = new ImpactModel({
      headline,
      description,
      link,
      image: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      category: category || 'success_story',
      tags: parsedTags,
      location: parsedLocation,
      metrics: parsedMetrics,
      featured: featured === 'true',
      priority: parseInt(priority) || 0,
      adminNotes: adminNotes || '',
      createdBy: req.user.id,
      status: 'draft'
    });

    await impact.save();

    res.status(201).json({
      message: 'Impact story created successfully',
      impact
    });
  } catch (error) {
    console.error('Error creating impact story:', error);
    res.status(500).json({ error: 'Failed to create impact story' });
  }
});

// Update impact story
router.put('/:id', auth, requireRole(['admin']), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Parse JSON fields
    if (updateData.tags) {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format for tags' });
      }
    }

    if (updateData.location) {
      try {
        updateData.location = JSON.parse(updateData.location);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format for location' });
      }
    }

    if (updateData.metrics) {
      try {
        updateData.metrics = JSON.parse(updateData.metrics);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON format for metrics' });
      }
    }

    // Handle image update
    if (req.file) {
      updateData.image = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    // Handle status change to published
    if (updateData.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
      updateData.publishedBy = req.user.id;
    }

    const impact = await ImpactModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('publishedBy', 'name email');

    if (!impact) {
      return res.status(404).json({ error: 'Impact story not found' });
    }

    res.json({
      message: 'Impact story updated successfully',
      impact
    });
  } catch (error) {
    console.error('Error updating impact story:', error);
    res.status(500).json({ error: 'Failed to update impact story' });
  }
});

// Delete impact story
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const impact = await ImpactModel.findById(id);
    if (!impact) {
      return res.status(404).json({ error: 'Impact story not found' });
    }

    // Delete the image file
    const imagePath = path.join(__dirname, '../../uploads/impact', impact.image.filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await ImpactModel.findByIdAndDelete(id);

    res.json({ message: 'Impact story deleted successfully' });
  } catch (error) {
    console.error('Error deleting impact story:', error);
    res.status(500).json({ error: 'Failed to delete impact story' });
  }
});

// Update impact story status
router.patch('/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    
    if (status === 'published') {
      updateData.publishedAt = new Date();
      updateData.publishedBy = req.user.id;
    }

    const impact = await ImpactModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('publishedBy', 'name email');

    if (!impact) {
      return res.status(404).json({ error: 'Impact story not found' });
    }

    res.json({
      message: 'Impact story status updated successfully',
      impact
    });
  } catch (error) {
    console.error('Error updating impact status:', error);
    res.status(500).json({ error: 'Failed to update impact status' });
  }
});

// Upload image only
router.post('/upload-image', auth, requireRole(['admin']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: `/uploads/impact/${req.file.filename}`,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get impact statistics
router.get('/stats/overview', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalImpacts = await ImpactModel.countDocuments();
    const publishedImpacts = await ImpactModel.countDocuments({ status: 'published' });
    const draftImpacts = await ImpactModel.countDocuments({ status: 'draft' });
    const featuredImpacts = await ImpactModel.countDocuments({ featured: true, status: 'published' });
    const totalViews = await ImpactModel.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalLikes = await ImpactModel.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);

    res.json({
      totalImpacts,
      publishedImpacts,
      draftImpacts,
      featuredImpacts,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0
    });
  } catch (error) {
    console.error('Error fetching impact statistics:', error);
    res.status(500).json({ error: 'Failed to fetch impact statistics' });
  }
});

module.exports = router;
