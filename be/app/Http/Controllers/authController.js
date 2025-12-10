const User = require('../../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {

    async register(req, res) {
        try {
            const { full_name, email, phone, password } = req.body;

            // Validate
            if (!full_name || !email || !password || !phone) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check Exists
            const exists = await User.checkExists(email, phone);
            if (exists) {
                return res.status(400).json({ message: 'User with this email or phone already exists' });
            }

            // Hash Password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Create User
            const userId = await User.create({
                full_name,
                email,
                phone,
                password_hash,
                status: 'active'
            });

            res.status(201).json({ message: 'User registered successfully', userId });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find User
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            // Check Password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }

            // Check Status
            if (user.status !== 'active') {
                return res.status(403).json({ message: 'Account is not active' });
            }

            // Generate Token
            const token = jwt.sign(
                {
                    id: user.user_id,
                    email: user.email,
                    roles: user.roles
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                message: 'Login Successful',
                token,
                user: {
                    id: user.user_id,
                    name: user.full_name,
                    email: user.email,
                    roles: user.roles
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
}

module.exports = new AuthController();
