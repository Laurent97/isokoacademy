const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Send OTP
router.post('/send-otp',
  [
    body('phone_number').isMobilePhone('any').withMessage('Invalid phone number'),
    body('country_code').optional().isString()
  ],
  authController.sendOTP
);

// Verify OTP
router.post('/verify-otp',
  [
    body('phone_number').isMobilePhone('any').withMessage('Invalid phone number'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid code')
  ],
  authController.verifyOTP
);

// Email + password
router.post('/signup',
  [body('email').isEmail(), body('password').isLength({ min: 8 })],
  authController.signup
);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', [body('password').isLength({ min: 8 })], authController.resetPassword);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
