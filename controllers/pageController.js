const homePage = (req, res) => {
    res.render('index', {
        layout: 'layouts/default',
        title: 'Technozen India - Training in Chennai',
        description: 'Technozen India offers industry-leading CNC Programming and SOLIDWORKS training in Ambattur, Chennai.'
    });
};

const aboutPage = (req, res) => {
    const breadcrumbs = [
        { text: 'Home', link: '/' },
        { text: 'About', link: '/about/our-story' }
    ];
    res.render('about', {
        title: 'About Technozen India',
        description: 'Learn about Technozen India’s mission to provide top-tier training in Ambattur, Chennai.',
        breadcrumbs
    });
};

const contactPage = (req, res) => {
    const breadcrumbs = [
        { text: 'Home', link: '/' },
        { text: 'Contact', link: '/contact' }
    ];
    res.render('contact', {
        title: 'Contact Technozen India',
        description: 'Get in touch with Technozen India for CNC and SOLIDWORKS training inquiries in Chennai.',
        breadcrumbs
    });
};

const studentDeskPage = (req, res) => {
    const breadcrumbs = [
        { text: 'Home', link: '/' },
        { text: 'Student Desk', link: '/student-desk' }
    ];
    res.render('student-desk', {
        title: 'Students Desk - Technozen India',
        description: 'Apply for CNC Programming or SOLIDWORKS training at Technozen India in Ambattur, Chennai.',
        breadcrumbs,
        csrfToken: req.csrfToken() // Pass CSRF token
    });
};

const solidWorksTrainingPage = (req, res) => {
    const breadcrumbs = [
        { text: 'Home', link: '/' },
        { text: 'Training', link: '/training' },
        { text: 'SolidWorks', link: '/training/solidworks' }
    ];
    res.render('solid-works', {
        title: 'SOLIDWORKS Training in Chennai',
        description: 'Join Technozen India’s SOLIDWORKS training in Ambattur, Chennai, for hands-on learning and certification.',
        breadcrumbs
    });
};

const cncProgramTrainingPage = (req, res) => {
    const breadcrumbs = [
        { text: 'Home', link: '/' },
        { text: 'Training', link: '/training' },
        { text: 'CNC Program', link: '/training/cnc-program' }
    ];
    res.render('cnc-program', {
        title: 'CNC Programming Training in Chennai',
        description: 'Join Technozen India’s CNC Turning and Milling training in Ambattur, Chennai, for industry-ready skills.',
        breadcrumbs
    });
};

module.exports = {
    homePage,
    aboutPage,
    contactPage,
    studentDeskPage,
    solidWorksTrainingPage,
    cncProgramTrainingPage
};