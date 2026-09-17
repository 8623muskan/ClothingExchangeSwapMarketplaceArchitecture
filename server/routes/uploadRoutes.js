const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/clothing', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Clothing image is required'
            });
        }

        const imageUrl =
            `http://127.0.0.1:${process.env.PORT || 5000}/uploads/${req.file.filename}`;

        console.log(`CLOTHING IMAGE UPLOADED: ${req.file.filename}`);

        return res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl
        });
    } catch (error) {
        console.error('UPLOAD ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
});

module.exports = router;