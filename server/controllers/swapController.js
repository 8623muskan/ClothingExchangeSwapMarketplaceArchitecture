const mongoose = require('mongoose');
const Swap = require('../models/Swap');
const ClothingItem = require('../models/ClothingItem');

function getUserId(req) {
    return req.user?._id || req.user?.id;
}

function isValidObjectId(value) {
    return (
        typeof value === 'string' &&
        mongoose.Types.ObjectId.isValid(value)
    );
}

async function createSwap(req, res) {
    try {
        const requester = getUserId(req);

        console.log('\n========== CREATE SWAP REQUEST ==========');
        console.log('Authenticated user:', requester);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        if (!requester) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const requestedItem =
            typeof req.body?.requestedItem === 'string'
                ? req.body.requestedItem.trim()
                : '';

        const offeredItem =
            typeof req.body?.offeredItem === 'string'
                ? req.body.offeredItem.trim()
                : '';

        const message =
            typeof req.body?.message === 'string'
                ? req.body.message.trim()
                : '';

        console.log('requestedItem:', requestedItem);
        console.log('offeredItem:', offeredItem);
        console.log('message length:', message.length);

        if (!requestedItem) {
            console.error('400: requestedItem is missing');

            return res.status(400).json({
                success: false,
                message: 'requestedItem is required'
            });
        }

        if (!isValidObjectId(requestedItem)) {
            console.error(
                '400: Invalid requestedItem:',
                requestedItem
            );

            return res.status(400).json({
                success: false,
                message: 'Invalid requested item ID'
            });
        }

        if (!offeredItem) {
            console.error('400: offeredItem is missing');

            return res.status(400).json({
                success: false,
                message: 'offeredItem is required'
            });
        }

        if (!isValidObjectId(offeredItem)) {
            console.error(
                '400: Invalid offeredItem:',
                offeredItem
            );

            return res.status(400).json({
                success: false,
                message: 'Invalid offered item ID'
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot exceed 1000 characters'
            });
        }

        const requestedClothing =
            await ClothingItem.findById(requestedItem);

        if (!requestedClothing) {
            console.error(
                '404: Requested item not found:',
                requestedItem
            );

            return res.status(404).json({
                success: false,
                message: 'Requested clothing item not found'
            });
        }

        const offeredClothing =
            await ClothingItem.findById(offeredItem);

        if (!offeredClothing) {
            console.error(
                '404: Offered item not found:',
                offeredItem
            );

            return res.status(404).json({
                success: false,
                message: 'Offered clothing item not found'
            });
        }

        const requestedOwner =
            String(requestedClothing.owner);

        const requesterId =
            String(requester);

        const offeredOwner =
            String(offeredClothing.owner);

        console.log('Requester:', requesterId);
        console.log('Requested item owner:', requestedOwner);
        console.log('Offered item owner:', offeredOwner);

        if (requestedOwner === requesterId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot request a swap for your own item'
            });
        }

        if (offeredOwner !== requesterId) {
            return res.status(403).json({
                success: false,
                message: 'You can only offer your own clothing item'
            });
        }

        if (requestedItem === offeredItem) {
            return res.status(400).json({
                success: false,
                message: 'You cannot offer the same item you are requesting'
            });
        }

        const existingSwap = await Swap.findOne({
            requester: requester,
            requestedItem: requestedItem,
            status: 'pending'
        });

        if (existingSwap) {
            console.log(
                '409: Existing pending swap:',
                existingSwap._id.toString()
            );

            return res.status(409).json({
                success: false,
                message:
                    'You already have a pending swap request for this item',
                swapId: existingSwap._id
            });
        }

        const swap = new Swap({
            requester: requester,
            owner: requestedClothing.owner,
            requestedItem: requestedItem,
            offeredItem: offeredItem,
            message: message
        });

        await swap.save();

        const populatedSwap =
            await Swap.findById(swap._id)
                .populate(
                    'requester',
                    'name email username'
                )
                .populate(
                    'owner',
                    'name email username'
                )
                .populate(
                    'requestedItem',
                    'title category size brand condition imageUrl estimatedValue location owner'
                )
                .populate(
                    'offeredItem',
                    'title category size brand condition imageUrl estimatedValue location owner'
                );

        console.log(
            'SWAP CREATED:',
            swap._id.toString()
        );

        console.log('========== CREATE SWAP SUCCESS ==========\n');

        return res.status(201).json({
            success: true,
            message: 'Swap request created successfully',
            swap: populatedSwap
        });

    } catch (error) {
        console.error('\n========== CREATE SWAP ERROR ==========');
        console.error(error);
        console.error('========================================\n');

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((item) => item.message)
                    .join(', ')
            });
        }

        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${error.path}`
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create swap request',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
}

async function getUserSwaps(req, res) {
    try {
        const authenticatedUser = getUserId(req);

        if (!authenticatedUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const swaps = await Swap.find({
            $or: [
                {
                    requester: authenticatedUser
                },
                {
                    owner: authenticatedUser
                }
            ]
        })
            .populate(
                'requester',
                'name email username'
            )
            .populate(
                'owner',
                'name email username'
            )
            .populate(
                'requestedItem',
                'title category size brand condition imageUrl estimatedValue location owner'
            )
            .populate(
                'offeredItem',
                'title category size brand condition imageUrl estimatedValue location owner'
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: swaps.length,
            swaps
        });

    } catch (error) {
        console.error(
            'GET USER SWAPS ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to load user swaps'
        });
    }
}

async function getSwapById(req, res) {
    try {
        const userId = getUserId(req);
        const { swapId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!isValidObjectId(swapId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid swap ID'
            });
        }

        const swap =
            await Swap.findById(swapId)
                .populate(
                    'requester',
                    'name email username'
                )
                .populate(
                    'owner',
                    'name email username'
                )
                .populate('requestedItem')
                .populate('offeredItem');

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: 'Swap request not found'
            });
        }

        const isParticipant =
            String(swap.requester?._id) === String(userId) ||
            String(swap.owner?._id) === String(userId);

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not part of this swap'
            });
        }

        return res.status(200).json({
            success: true,
            swap
        });

    } catch (error) {
        console.error(
            'GET SWAP ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to load swap'
        });
    }
}

async function updateSwap(req, res) {
    try {
        const userId = getUserId(req);
        const { swapId } = req.params;
        const { status } = req.body || {};

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!isValidObjectId(swapId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid swap ID'
            });
        }

        const allowedStatuses = [
            'accepted',
            'rejected',
            'cancelled',
            'completed'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid swap status'
            });
        }

        const swap =
            await Swap.findById(swapId);

        if (!swap) {
            return res.status(404).json({
                success: false,
                message: 'Swap request not found'
            });
        }

        const isRequester =
            String(swap.requester) === String(userId);

        const isOwner =
            String(swap.owner) === String(userId);

        if (!isRequester && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'You are not part of this swap'
            });
        }

        if (
            status === 'accepted' &&
            !isOwner
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Only the item owner can accept a swap'
            });
        }

        if (
            status === 'rejected' &&
            !isOwner
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Only the item owner can reject a swap'
            });
        }

        if (
            status === 'cancelled' &&
            !isRequester
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Only the requester can cancel a swap'
            });
        }

        if (
            swap.status !== 'pending' &&
            status !== 'completed'
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot change a ${swap.status} swap`
            });
        }

        swap.status = status;

        await swap.save();

        const updatedSwap =
            await Swap.findById(swap._id)
                .populate(
                    'requester',
                    'name email username'
                )
                .populate(
                    'owner',
                    'name email username'
                )
                .populate('requestedItem')
                .populate('offeredItem');

        return res.status(200).json({
            success: true,
            message:
                `Swap ${status} successfully`,
            swap: updatedSwap
        });

    } catch (error) {
        console.error(
            'UPDATE SWAP ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to update swap'
        });
    }
}

module.exports = {
    createSwap,
    getUserSwaps,
    getSwapById,
    updateSwap
};