const express = require('express');
const router = express.Router();

const {
    getItems,
    getItemById,
    createItem,
    getMyItems,
    updateItem,
    deleteItem
} = require('../controllers/itemController');

const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Items API is working' });
});

router.get('/', getItems);
router.get('/mine', protect, getMyItems);
router.get('/:itemId', getItemById);
router.post('/', protect, upload.single('image'), createItem);
router.put('/:itemId', protect, upload.single('image'), updateItem);
router.delete('/:itemId', protect, deleteItem);

module.exports = router;
