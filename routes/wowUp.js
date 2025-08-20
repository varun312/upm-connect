const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, 'wowup-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET /wowUp - render upload form
router.get('/', (req, res) => {
    res.render('wowup');
});


// POST /wowUp - handle upload and preprocessing
router.post('/', upload.single('document'), async (req, res) => {
    const sharp = require('sharp');
    const sharpPhash = require('sharp-phash');
    const originalPath = req.file.path;
    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.filename, ext);
    const thumbName = baseName + '-thumb' + ext;
    const thumbPath = path.join(path.dirname(originalPath), thumbName);

    try {
        // Convert to grayscale and resize to 128x128 (stretch, no crop), save as thumbnail
        await sharp(originalPath)
            .resize(512, 512, { fit: 'fill' })
            .grayscale()
            .toFile(thumbPath);

        // Generate perceptual hash (pHash) for the uploaded image using sharp-phash
        const phash = await sharpPhash(thumbPath);
        console.log('pHash for', originalPath, ':', phash);

        res.render('wowup', {
            message: 'File uploaded and thumbnail created!',
            filePath: originalPath.replace(/\\/g, '/'),
            thumbPath: thumbPath.replace(/\\/g, '/')
        });
    } catch (err) {
        console.error('Error processing image:', err);
        res.render('wowup', { message: 'Error processing image.' });
    }
});

module.exports = router;
