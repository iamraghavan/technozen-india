const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
        breadcrumbs,
        csrfToken: req.csrfToken(),
        
    });
};

const submitContactForm = (req, res) => {
  const { username, email, subject, phone, message } = req.body;

  const newEnquiry = {
    enquiry_id: uuidv4(),  // generate enquiry_id
    username,
    email,
    subject,
    phone,
    message,
    date: new Date().toISOString(),       // enquiry submission datetime
    timestamp: Date.now()                 // numeric timestamp (optional if you want)
  };

  const filePath = path.join(__dirname, '../data/contact_enquiry.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let enquiries = [];
    if (!err && data) {
      try {
        enquiries = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        return res.status(500).send('Error parsing existing enquiries.');
      }
    }

    enquiries.push(newEnquiry);

    fs.writeFile(filePath, JSON.stringify(enquiries, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Error saving enquiry.');
      }

      // Redirect with query parameters
      return res.redirect(`/contact?success=true&enquiry_id=${newEnquiry.enquiry_id}`);
    });
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
    cncProgramTrainingPage,
    submitContactForm
};