const User = require('./auth.model');
const jwt = require('jsonwebtoken');

// JWT token generate cheyyanulla helper function
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE, // Token expire aakunnathulla time
    });
};

// @desc    Register a new shop owner
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // User already exist aano ennu check cheyyunnu
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Pudiya user create cheyyunnu
        const user = await User.create({
            name,
            email,
            password,
        });

        // JWT token create cheyyunnu
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token, // Token response aayi kodukkunnu
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error); // Error vannal error handler-ilekku vidunnu
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Email-um password-um kittiyitundo ennu nokkunnu
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Database-il user undo ennu check cheyyunnu
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Kodutha password correct aano ennu check cheyyunnu
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Login success aayal token generate cheyyunnu
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        // Current user-ne database-il ninnu edukkunnu
        const user = await User.findById(req.user.id).populate('storeId').select('-password');
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        
        // Pudiya email vere aarelum use cheyyunnundo ennu check cheyyunnu
        if (email && email !== req.user.email) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }
        
        // Profile update cheyyunnu
        const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true }).select('-password');
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');
        
        // Pazhaya password match aakunnundo ennu nokkunnu
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
        
        // Pudiya password save cheyyunnu
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Password updated' });
    } catch (error) {
        next(error);
    }
};
