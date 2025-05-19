exports.homePage = (req, res) => {
  res.render('index', { layout: 'layouts/default', title: 'Home' });
};

exports.aboutPage = (req, res) => {
  const breadcrumbs = [
    { text: 'Home', link: '/' }, 
    { text: 'About', link: '/about' }
  ];
  const pageTitle = 'About Us';
  
  res.render('about', { 
    title: pageTitle,
    breadcrumbs: breadcrumbs
  });
};

exports.studentDeskPage = (req, res) => {
  const breadcrumbs = [
    { text: 'Home', link: '/' }, 
    { text: 'Student Desk', link: '/student-desk' }
  ];
  const pageTitle = 'Student Desk';
  
  res.render('student-desk', { 
    title: pageTitle,
    breadcrumbs: breadcrumbs
  });
};

exports.contactPage = (req, res) => {
  res.render('contact', { title: 'Contact Us' });
};
