const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');

const JWT_SECRET =
    process.env.JWT_SECRET ||
    'clothing_exchange_marketplace_dev_secret_2026_secure_key';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function createToken(userId) {
    return jwt.sign(
        {
            userId
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );
}

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        location: user.location,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
    };
}

async function register(req, res) {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const username = String(req.body.username || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const location = String(req.body.location || '').trim();

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({
                    success: false,
                    message: 'Email is already registered'
                });
            }

            return res.status(409).json({
                success: false,
                message: 'Username is already taken'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            location
        });

        const token = createToken(user._id.toString());

        console.log(`User registered: ${user.email}`);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: publicUser(user)
        });
    } catch (error) {
        console.error('REGISTER ERROR:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Email or username already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
}

async function login(req, res) {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const identifier = String(
            req.body.email ||
            req.body.username ||
            req.body.identifier ||
            ''
        )
            .trim()
            .toLowerCase();

        const password = String(req.body.password || '');

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/username and password are required'
            });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/username or password'
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email/username or password'
            });
        }

        const token = createToken(user._id.toString());

        console.log(`User logged in: ${user.email}`);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: publicUser(user)
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
}

async function getProfile(req, res) {
    return res.status(200).json({
        success: true,
        user: publicUser(req.user)
    });
}

async function updateProfile(req, res) {
    try {
        const allowedFields = ['username', 'location', 'avatar'];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                req.user[field] = String(req.body[field]).trim();
            }
        }

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: publicUser(req.user)
        });
    } catch (error) {
        console.error('PROFILE UPDATE ERROR:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Profile update failed'
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
