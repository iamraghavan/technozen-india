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

exports.contactPage = (req, res) => {
  res.render('contact', { title: 'Contact Us' });
};
