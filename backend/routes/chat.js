const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

// GET /api/chat/:projectId — fetch message history (last 100)
router.get('/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;
        // verify project exists and user has access
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!req.user.isAdmin && project.clientEmail !== req.user.email) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (project.adminDecision !== 'Accepted') {
            return res.status(403).json({ message: 'Chat not available until project is accepted' });
        }

        const messages = await ChatMessage.find({ projectId })
            .sort({ timestamp: 1 })
            .limit(100)
            .lean();

        res.json(messages);
    } catch (err) {
        console.error('Chat history error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
