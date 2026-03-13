const express = require('express');
const router = express.Router();
const { getMessages } = require('../lib/chatQueries.cjs');
const { getProjectById } = require('../lib/projectQueries.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

// GET /api/chat/:projectId — fetch message history (last 100)
router.get('/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;

        // Verify project exists and user has access
        const project = await getProjectById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!req.user.isAdmin && project.clientEmail !== req.user.email) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (project.adminDecision !== 'Accepted') {
            return res.status(403).json({ message: 'Chat not available until project is accepted' });
        }

        const messages = await getMessages(projectId);
        res.json(messages);
    } catch (err) {
        console.error('Chat history error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
