const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper: generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// POST /api/forgot-password/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'No account found with this email' });

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

        // Send email
        await transporter.sendMail({
            from: `"Webnario" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Webnario Password Reset OTP',
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;color:#fff;border-radius:12px">
                    <h2 style="color:#e11d48;margin-bottom:8px">Webnario</h2>
                    <p style="color:#aaa;margin-bottom:24px">You requested a password reset.</p>
                    <div style="background:#1a1a1a;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
                        <p style="color:#aaa;font-size:14px;margin-bottom:8px">Your OTP (valid for 10 minutes)</p>
                        <h1 style="color:#e11d48;font-size:48px;letter-spacing:16px;margin:0">${otp}</h1>
                    </div>
                    <p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
                </div>
            `,
        });

        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ message: 'Failed to send OTP. Try again.' });
    }
});

// POST /api/forgot-password/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

        const record = await OTP.findOne({ email: email.toLowerCase(), used: false });
        if (!record) return res.status(400).json({ message: 'OTP not found or already used' });

        if (new Date() > record.expiresAt) {
            await OTP.deleteOne({ _id: record._id });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (record.otp !== otp.toString()) {
            return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
        }

        // Mark OTP as used
        record.used = true;
        await record.save();

        res.json({ message: 'OTP verified', verified: true });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/forgot-password/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP and new password are required' });
        }

        // Re-verify OTP (used = true means it was verified)
        const record = await OTP.findOne({ email: email.toLowerCase(), otp, used: true });
        if (!record) return res.status(400).json({ message: 'Session expired. Please restart the process.' });

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { password: hashed }
        );

        // Clean up OTP
        await OTP.deleteMany({ email: email.toLowerCase() });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
