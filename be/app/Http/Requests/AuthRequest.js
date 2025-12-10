const { body } = require('express-validator');

const registerRules = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('role').isIn(['MEMBER', 'TRAINER', 'STAFF', 'ADMIN']).withMessage('Invalid role'),
];

const loginRules = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerRules, loginRules };
