const supabase = require('./supabase');

/**
 * Find a user by email (case-insensitive).
 */
const findByEmail = async (email) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
};

/**
 * Create a new user.
 * @param {{ name: string, email: string, password: string, is_admin?: boolean }} userData
 */
const createUser = async ({ name, email, password, is_admin = false }) => {
    const { data, error } = await supabase
        .from('users')
        .insert({ name, email: email.toLowerCase(), password, is_admin })
        .select()
        .single();
    if (error) throw error;
    return data;
};

/**
 * Update a user's password by email.
 */
const updatePassword = async (email, hashedPassword) => {
    const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword, updated_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());
    if (error) throw error;
};

module.exports = { findByEmail, createUser, updatePassword };
