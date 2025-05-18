const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.homePage);
router.get('/about', pageController.aboutPage);
router.get('/contact', pageController.contactPage);

module.exports = router;
