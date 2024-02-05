const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const validator = require("email-validator");
const nodemailer = require('nodemailer');


const { User, ActivationKey } = require('../models/collections');

const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res, next) => {
    try {
        const email = req.body.email.toLowerCase();
        const user = await User.findOne({ email: email });
        if (user) {
            const error = new Error("Email already exists");
            error.statusCode = 400;
            throw error;
        }

        const isValid = validator.validate(email);

        if (!isValid) {
            const error = new Error("Email is not valid")
            error.statusCode = 400;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = await User.create({
            ...req.body,
            password: hashedPassword,
        });
        // generate a 6 chars code
        const activationKey = Math.floor(100000 + Math.random() * 900000);
        const key = activationKey.toString();
        console.log(key);

        await ActivationKey.create({
            key,
            userId: newUser._id,
        });

        const message = `Your activation code is ${key}\n if you didn't request the code just ignore it`;

        await sendEmail('Activation Code', newUser.email, message);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

const login = async (req, res, next) => {
    try {
        const email = req.body.email.toLowerCase();

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        };

        if (user.status === 'pending') {
            const error = new Error("User not activated yet");
            error.statusCode = 404;
            throw error;
        };

        if (req.body.uniqueId !== user.uniqueId) {
            const error = new Error("This account can only be accessed throw one phone");
            error.statusCode = 404;
            throw error;
        };

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            const error = new Error("Incorrect password");
            error.statusCode = 401;
            throw error;
        }
        const accessToken = await jwt.sign(user.toObject(), JWT_SECRET, { expiresIn: '7d' })

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            accessToken
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

async function sendEmail(subject, toEmail, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD,
            },
        });

        const mailDetails = {
            from: process.env.GMAIL_EMAIL,
            to: toEmail,
            subject: subject,
            text: message
        };

        await transporter
            .sendMail(mailDetails);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        console.log(next);
    }

}

const activateAccount = async (req, res, next) => {
    try {
        const activationKey = req.body.key;
        const key = await ActivationKey.findOne({ key: activationKey });
        if (!key) {
            const error = new Error("Invalid activation key");
            error.statusCode = 404;
            throw error;
        }

        const user = await User.findById(key.userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        user.status = 'activated';
        await user.save();
        await key.deleteOne();
        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            data: user
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

const requestPasswordChange = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        // generate a 6 chars code
        const activationKey = Math.floor(100000 + Math.random() * 900000);
        const key = activationKey.toString();
        console.log(key);
        await ActivationKey.create({
            key,
            userId: user._id,
        })
        const message = `Your change password code is ${key}\n if you didn't request the code just ignore it`;
        await sendEmail('Activation Code', user.email, message);
        res.status(200).json({
            success: true,
            message: 'Activation code sent successfully',
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
const confirmPasswordChange = async (req, res, next) => {
    try {
        const activationKey = req.body.key;
        const key = await ActivationKey.findOne({ key: activationKey });

        if (!key) {
            const error = new Error("Invalid activation key");
            error.statusCode = 404;
            throw error;
        }

        const user = await User.findById(key.userId);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        await key.deleteOne();
        res.status(200).json({
            success: true,
            message: 'key is correct, you can change the password now',
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
const changePassword = async (req, res, next) => {
    try {

        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: user
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}



module.exports = {
    signup,
    login,
    activateAccount,
    requestPasswordChange,
    confirmPasswordChange,
    changePassword,
}