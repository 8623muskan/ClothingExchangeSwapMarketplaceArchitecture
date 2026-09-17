const express = require('express');

const swapController = require('../controllers/swapController');
const authMiddleware = require('../middleware/authMiddleware');

const protect =
    typeof authMiddleware === 'function'
        ? authMiddleware
        : authMiddleware.protect;

const {
    createSwap,
    getUserSwaps,
    getSwapById,
    updateSwap
} = swapController;

if (typeof protect !== 'function') {
    throw new TypeError(
        'ERROR: authMiddleware protect is not a function'
    );
}

if (typeof createSwap !== 'function') {
    throw new TypeError(
        `ERROR: createSwap is not a function. Export received: ${Object.keys(swapController).join(', ')}`
    );
}

if (typeof getUserSwaps !== 'function') {
    throw new TypeError(
        'ERROR: getUserSwaps is not a function'
    );
}

if (typeof getSwapById !== 'function') {
    throw new TypeError(
        'ERROR: getSwapById is not a function'
    );
}

if (typeof updateSwap !== 'function') {
    throw new TypeError(
        'ERROR: updateSwap is not a function'
    );
}

const router = express.Router();

router.get(
    '/health',
    (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Swaps API is working'
        });
    }
);

router.post(
    '/',
    protect,
    createSwap
);

router.get(
    '/user/:userId',
    protect,
    getUserSwaps
);

router.get(
    '/:swapId',
    protect,
    getSwapById
);

router.put(
    '/:swapId',
    protect,
    updateSwap
);

module.exports = router;