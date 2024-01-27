const express = require('express');

const { signup,
    login,
    activateAccount,
    requestPasswordChange,
    confirmPasswordChange,
    changePassword,
} = require('../controllers/auth.controllers');

const router = express.Router();


router.post('/signup', signup);

router.post('/login', login);

router.post('/activateAccount', activateAccount)

router.post('/requestPasswordChange', requestPasswordChange);

router.post('/confirmPasswordChange', confirmPasswordChange);

router.post('/changePassword', changePassword);




module.exports = router;
