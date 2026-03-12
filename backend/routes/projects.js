const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/projects — admin gets all, client gets own
router.get('/', authMiddleware, async (req, res) => {
    try {
        let projects;
        if (req.user.isAdmin) {
            projects = await Project.find().sort({ createdAt: -1 });
        } else {
            projects = await Project.find({ clientEmail: req.user.email }).sort({ createdAt: -1 });
        }
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/projects — client submits a project
router.post('/', authMiddleware, async (req, res) => {
    try {
        const data = {
            ...req.body,
            clientEmail: req.user.email,
            clientName: req.user.name,
            status: 'Pending',
            adminDecision: 'Pending',
            notes: [],
            createdAt: new Date().toISOString(),
        };
        const project = await Project.create(data);
        res.status(201).json(project);
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/projects/:id/status — admin updates workflow status
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/projects/:id/decision — admin accepts or rejects
router.patch('/:id/decision', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { decision } = req.body; // "Accepted" | "Rejected"
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { adminDecision: decision },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/projects/:id/notes — admin adds a note
router.post('/:id/notes', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $push: { notes: { text, date: new Date().toISOString() } } },
            { new: true }
        );
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/projects/:id — admin deletes a project
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
