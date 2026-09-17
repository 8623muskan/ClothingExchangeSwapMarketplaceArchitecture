const ClothingItem = require('../models/ClothingItem');

const getItems = async (req, res) => {
    try {
        const filter = {};

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.gender) {
            filter.gender = req.query.gender;
        }

        if (req.query.size) {
            filter.size = req.query.size;
        }

        if (req.query.brand) {
            filter.brand = {
                $regex: String(req.query.brand),
                $options: 'i'
            };
        }

        if (req.query.condition) {
            filter.condition = req.query.condition;
        }

        if (req.query.color) {
            filter.color = {
                $regex: String(req.query.color),
                $options: 'i'
            };
        }

        if (req.query.search) {
            const search = String(req.query.search).trim();

            if (search) {
                filter.$or = [
                    {
                        title: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        description: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        brand: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        category: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        color: {
                            $regex: search,
                            $options: 'i'
                        }
                    },
                    {
                        location: {
                            $regex: search,
                            $options: 'i'
                        }
                    }
                ];
            }
        }

        const items = await ClothingItem
            .find(filter)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        console.log(
            `MARKETPLACE: ${items.length} item(s) found`
        );

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        console.error(
            'GET ITEMS ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch clothing items',
            error: error.message
        });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await ClothingItem
            .findById(req.params.itemId)
            .populate('owner', 'name email');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Clothing item not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error('GET ITEM ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch clothing item',
            error: error.message
        });
    }
};

const createItem = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const requiredFields = [
            'title',
            'category',
            'size',
            'condition',
            'gender',
            'location'
        ];

        for (const field of requiredFields) {
            if (
                !req.body[field] ||
                String(req.body[field]).trim() === ''
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Clothing image is required'
            });
        }

        const estimatedValue =
            req.body.estimatedValue === undefined ||
            req.body.estimatedValue === ''
                ? 0
                : Number(req.body.estimatedValue);

        if (
            Number.isNaN(estimatedValue) ||
            estimatedValue < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Estimated value must be a valid non-negative number'
            });
        }

        const item = await ClothingItem.create({
            title: String(req.body.title).trim(),

            description:
                req.body.description
                    ? String(req.body.description).trim()
                    : '',

            category:
                String(req.body.category).trim(),

            size:
                String(req.body.size).trim(),

            brand:
                req.body.brand
                    ? String(req.body.brand).trim()
                    : '',

            brandWebsite:
                req.body.brandWebsite
                    ? String(req.body.brandWebsite).trim()
                    : '',

            condition:
                String(req.body.condition).trim(),

            gender:
                String(req.body.gender).trim(),

            color:
                req.body.color
                    ? String(req.body.color).trim()
                    : '',

            location:
                String(req.body.location).trim(),

            estimatedValue,

            imageUrl:
                `/uploads/items/${req.file.filename}`,

            owner:
                req.user._id
        });

        const populatedItem =
            await ClothingItem
                .findById(item._id)
                .populate('owner', 'name email');

        return res.status(201).json({
            success: true,
            message: 'Clothing item created successfully',
            data: populatedItem
        });

    } catch (error) {
        console.error(
            'CREATE ITEM ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to create clothing item',
            error: error.message
        });
    }
};

const getMyItems = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const items = await ClothingItem
            .find({
                owner: req.user._id
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });

    } catch (error) {
        console.error(
            'GET MY ITEMS ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch your listings',
            error: error.message
        });
    }
};

const updateItem = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const item =
            await ClothingItem.findById(
                req.params.itemId
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Clothing item not found'
            });
        }

        if (
            item.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You can only update your own listing'
            });
        }

        const allowedFields = [
            'title',
            'description',
            'category',
            'size',
            'brand',
            'brandWebsite',
            'condition',
            'gender',
            'color',
            'location',
            'estimatedValue'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'estimatedValue') {
                    const value =
                        Number(req.body[field]);

                    if (
                        Number.isNaN(value) ||
                        value < 0
                    ) {
                        return res.status(400).json({
                            success: false,
                            message:
                                'Estimated value must be a valid non-negative number'
                        });
                    }

                    item[field] = value;
                } else {
                    item[field] =
                        String(
                            req.body[field]
                        ).trim();
                }
            }
        }

        if (req.file) {
            item.imageUrl =
                `/uploads/items/${req.file.filename}`;
        }

        await item.save();

        const updatedItem =
            await ClothingItem
                .findById(item._id)
                .populate('owner', 'name email');

        return res.status(200).json({
            success: true,
            message:
                'Clothing item updated successfully',
            data: updatedItem
        });

    } catch (error) {
        console.error(
            'UPDATE ITEM ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to update clothing item',
            error: error.message
        });
    }
};

const deleteItem = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const item =
            await ClothingItem.findById(
                req.params.itemId
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Clothing item not found'
            });
        }

        if (
            item.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You can only delete your own listing'
            });
        }

        await ClothingItem.findByIdAndDelete(
            req.params.itemId
        );

        return res.status(200).json({
            success: true,
            message:
                'Clothing item deleted successfully'
        });

    } catch (error) {
        console.error(
            'DELETE ITEM ERROR:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to delete clothing item',
            error: error.message
        });
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    getMyItems,
    updateItem,
    deleteItem
};