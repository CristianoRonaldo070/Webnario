const supabase = require('./supabase.cjs');

/** Delete all OTPs for an email */
const deleteByEmail = async (email) => {
    const { error } = await supabase
        .from('otps')
        .delete()
        .eq('email', email.toLowerCase());
    if (error) throw error;
};

/** Create a new OTP record */
const createOtp = async ({ email, otp, expiresAt }) => {
    const { data, error } = await supabase
        .from('otps')
        .insert({ email: email.toLowerCase(), otp, expires_at: expiresAt.toISOString(), used: false })
        .select()
        .single();
    if (error) throw error;
    return data;
};

/** Find an unused OTP for an email */
const findUnusedOtp = async (email) => {
    const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('used', false)
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
};

/** Mark an OTP as used */
const markUsed = async (id) => {
    const { error } = await supabase
        .from('otps')
        .update({ used: true })
        .eq('id', id);
    if (error) throw error;
};

/** Delete a single OTP by id */
const deleteOtpById = async (id) => {
    const { error } = await supabase
        .from('otps')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

/** Find a used (verified) OTP by email + otp value */
const findVerifiedOtp = async (email, otp) => {
    const { data, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('otp', otp)
        .eq('used', true)
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
};

module.exports = { deleteByEmail, createOtp, findUnusedOtp, markUsed, deleteOtpById, findVerifiedOtp };
