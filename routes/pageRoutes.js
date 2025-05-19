const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.homePage);
router.get('/about/our-story', pageController.aboutPage);
router.get('/contact', pageController.contactPage);
router.get('/student-desk', pageController.studentDeskPage); 

module.exports = router;
