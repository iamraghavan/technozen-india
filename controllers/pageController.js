exports.homePage = (req, res) => {
  res.render('index', { layout: 'layouts/default', title: 'Home' });
};

exports.aboutPage = (req, res) => {
  res.render('about', { title: 'About Us' });
};

exports.contactPage = (req, res) => {
  res.render('contact', { title: 'Contact Us' });
};
