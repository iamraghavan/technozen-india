const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const studentAdmissionController = require('../controllers/studentAdmissionController');
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });

router.get('/', pageController.homePage);
router.get('/about/our-story', pageController.aboutPage);
router.get('/contact', csrfProtection, pageController.contactPage);
router.post('/contact', csrfProtection,pageController.submitContactForm);
router.get('/student-desk', csrfProtection, pageController.studentDeskPage);
router.post('/student-desk/admission', csrfProtection, studentAdmissionController.submitAdmissionForm);
router.get('/training/solidworks', pageController.solidWorksTrainingPage);
router.get('/training/cnc-program', pageController.cncProgramTrainingPage);

module.exports = router;