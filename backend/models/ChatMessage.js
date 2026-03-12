const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    projectId: { type: String, required: true, index: true },
    senderEmail: { type: String, required: true },
    senderName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
