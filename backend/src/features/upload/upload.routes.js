const express = require('express');
const { protect } = require('../../middleware/auth.middleware');
const { upload } = require('../../config/cloudinary');

const router = express.Router();

// Single image upload
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        res.status(200).json({
            success: true,
            data: {
                url: req.file.path,
                publicId: req.file.filename
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

// Multiple images upload (up to 5)
router.post('/multiple', protect, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No image files provided' });
        }
        const urls = req.files.map(file => ({
            url: file.path,
            publicId: file.filename
        }));
        res.status(200).json({ success: true, data: urls });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

module.exports = router;
