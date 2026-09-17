const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET =
    process.env.JWT_SECRET ||
    'clothing_exchange_marketplace_dev_secret_2026_secure_key';

async function protect(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }

        if (!authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format'
            });
        }

        const token = authorization.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const userId =
            decoded.userId ||
            decoded.id ||
            decoded._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token payload'
            });
        }

        const user = await User.findById(userId)
            .select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error(
            'AUTH MIDDLEWARE ERROR:',
            error.message
        );

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token'
        });
    }
}

module.exports = protect;