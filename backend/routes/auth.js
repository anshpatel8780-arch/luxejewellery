const router = require('express').Router();
const { register, login, getProfile, updateProfile, updateProfileImage, getAllUsers, deleteUser, toggleSuspension } = require('../controllers/authController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/profile/image', auth, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof require('multer').MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large (Max 100MB)' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, updateProfileImage);
router.get('/users', auth, admin, getAllUsers);
router.patch('/users/:id/suspend', auth, admin, toggleSuspension);
router.delete('/users/:id', auth, admin, deleteUser);

module.exports = router;
