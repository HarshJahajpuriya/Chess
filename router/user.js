const express = require('express');
const { createGuestUser, createUser, loginUser, getLoggedInUser, authenticateUser, logoutUser, findOpponent } = require('../controller/user');

const router = express.Router();

router.post('/create-guest-user', createGuestUser);
router.post('/create-user', createUser);
router.post('/login-user', loginUser);
router.post('/find-opponent', authenticateUser, findOpponent)
router.get('/get-logged-in-user', authenticateUser, getLoggedInUser);
router.get('/logout-user', authenticateUser, logoutUser)

module.exports = router;
