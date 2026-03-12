const supabase = require('./supabase');

/** Get last 100 messages for a project, sorted oldest first */
const getMessages = async (projectId) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true })
        .limit(100);
    if (error) throw error;
    return data.map(normalizeMessage);
};

/** Create a new chat message */
const createMessage = async ({ projectId, senderEmail, senderName, isAdmin, text }) => {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            project_id: projectId,
            sender_email: senderEmail,
            sender_name: senderName,
            is_admin: isAdmin || false,
            text,
            timestamp: new Date().toISOString(),
        })
        .select()
        .single();
    if (error) throw error;
    return normalizeMessage(data);
};

/** Normalize Supabase row → shape matching the old Mongoose ChatMessage document */
const normalizeMessage = (row) => ({
    _id: row.id,
    id: row.id,
    projectId: row.project_id,
    senderEmail: row.sender_email,
    senderName: row.sender_name,
    isAdmin: row.is_admin,
    text: row.text,
    timestamp: row.timestamp,
});

module.exports = { getMessages, createMessage };
