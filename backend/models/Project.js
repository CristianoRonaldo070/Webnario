const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString() },
});

const projectSchema = new mongoose.Schema({
    clientEmail: { type: String, required: true },
    clientName: { type: String, required: true },
    projectName: { type: String, required: true },
    description: { type: String, required: true },
    websiteType: { type: String, required: true },
    numberOfPages: { type: Number, default: 1 },
    featuresNeeded: { type: [String], default: [] },
    techStack: { type: String, default: '' },
    referenceWebsites: { type: String, default: '' },
    budgetRange: { type: String, default: '' },
    deadline: { type: String, default: '' },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
    },
    fileName: { type: String, default: '' },
    contactMethod: { type: String, default: '' },
    status: {
        type: String,
        enum: ['Pending', 'In Review', 'In Progress', 'Completed', 'Delivered'],
        default: 'Pending',
    },
    adminDecision: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
    },
    notes: { type: [noteSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model('Project', projectSchema);
