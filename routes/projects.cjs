const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    getProjectsByEmail,
    getProjectById,
    createProject,
    updateProjectStatus,
    updateAdminDecision,
    addNote,
    deleteProject,
} = require('../lib/projectQueries.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// GET /api/projects — admin gets all, client gets own
router.get('/', authMiddleware, async (req, res) => {
    try {
        let projects;
        if (req.user.isAdmin) {
            projects = await getAllProjects();
        } else {
            projects = await getProjectsByEmail(req.user.email);
        }
        res.json(projects);
    } catch (err) {
        console.error('Get projects error:', err);
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
        };
        const project = await createProject(data);
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
        const project = await updateProjectStatus(req.params.id, status);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/projects/:id/decision — admin accepts or rejects
router.patch('/:id/decision', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { decision } = req.body; // "Accepted" | "Rejected"
        const project = await updateAdminDecision(req.params.id, decision);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error('Update decision error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/projects/:id/notes — admin adds a note
router.post('/:id/notes', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const project = await addNote(req.params.id, text);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error('Add note error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/projects/:id — admin deletes a project
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await deleteProject(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('Delete project error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
