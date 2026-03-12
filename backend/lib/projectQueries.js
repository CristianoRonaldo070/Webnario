const supabase = require('./supabase');

/** Get all projects (admin) */
const getAllProjects = async () => {
    const { data, error } = await supabase
        .from('projects')
        .select('*, project_notes(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(normalizeProject);
};

/** Get projects for a specific client */
const getProjectsByEmail = async (email) => {
    const { data, error } = await supabase
        .from('projects')
        .select('*, project_notes(*)')
        .eq('client_email', email.toLowerCase())
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(normalizeProject);
};

/** Get a single project by ID */
const getProjectById = async (id) => {
    const { data, error } = await supabase
        .from('projects')
        .select('*, project_notes(*)')
        .eq('id', id)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return normalizeProject(data);
};

/** Create a new project */
const createProject = async (projectData) => {
    const row = {
        client_email: projectData.clientEmail,
        client_name: projectData.clientName,
        project_name: projectData.projectName,
        description: projectData.description,
        website_type: projectData.websiteType,
        number_of_pages: projectData.numberOfPages || 1,
        features_needed: projectData.featuresNeeded || [],
        tech_stack: projectData.techStack || '',
        reference_websites: projectData.referenceWebsites || '',
        budget_range: projectData.budgetRange || '',
        deadline: projectData.deadline || '',
        priority: projectData.priority || 'Medium',
        file_name: projectData.fileName || '',
        contact_method: projectData.contactMethod || '',
        status: 'Pending',
        admin_decision: 'Pending',
    };
    const { data, error } = await supabase
        .from('projects')
        .insert(row)
        .select('*, project_notes(*)')
        .single();
    if (error) throw error;
    return normalizeProject(data);
};

/** Admin: update project workflow status */
const updateProjectStatus = async (id, status) => {
    const { data, error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', id)
        .select('*, project_notes(*)')
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return normalizeProject(data);
};

/** Admin: update admin decision */
const updateAdminDecision = async (id, adminDecision) => {
    const { data, error } = await supabase
        .from('projects')
        .update({ admin_decision: adminDecision })
        .eq('id', id)
        .select('*, project_notes(*)')
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    return normalizeProject(data);
};

/** Admin: add a note to a project */
const addNote = async (projectId, text) => {
    const noteDate = new Date().toISOString();
    const { error: noteError } = await supabase
        .from('project_notes')
        .insert({ project_id: projectId, text, date: noteDate });
    if (noteError) throw noteError;

    // Return updated project with notes
    return await getProjectById(projectId);
};

/** Admin: delete a project */
const deleteProject = async (id) => {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

/**
 * Normalize Supabase snake_case rows → camelCase shape
 * matching the old Mongoose document shape that frontend expects.
 */
const normalizeProject = (row) => {
    return {
        _id: row.id,
        id: row.id,
        clientEmail: row.client_email,
        clientName: row.client_name,
        projectName: row.project_name,
        description: row.description,
        websiteType: row.website_type,
        numberOfPages: row.number_of_pages,
        featuresNeeded: row.features_needed || [],
        techStack: row.tech_stack,
        referenceWebsites: row.reference_websites,
        budgetRange: row.budget_range,
        deadline: row.deadline,
        priority: row.priority,
        fileName: row.file_name,
        contactMethod: row.contact_method,
        status: row.status,
        adminDecision: row.admin_decision,
        notes: (row.project_notes || []).map(n => ({
            _id: n.id,
            text: n.text,
            date: n.date,
        })),
        createdAt: row.created_at,
    };
};

module.exports = {
    getAllProjects,
    getProjectsByEmail,
    getProjectById,
    createProject,
    updateProjectStatus,
    updateAdminDecision,
    addNote,
    deleteProject,
};
