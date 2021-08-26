const bcrypt = require('bcrypt');
const passport = require('passport');

const pugTemplate = `${__dirname}/views/pug`;

module.exports = function (app, myDataBase) {

  const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) return next();

    res.redirect('/');
  };

  app.route('/').get((req, res) => {
    res.render(
      `${pugTemplate}/index`,
      {
        title: 'Connected to Database',
        message: 'Please login',
        showLogin: true,
        showRegistration: true,
        showSocialAuth: true
      }
    );
  });

  app.route('/login').post(
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(`${pugTemplate}/profile`, {username: req.user.username});
  });

  app.route('/logout').get((req, res) => {
      req.logout();
      res.redirect('/');
  });

  app.route('/auth/github').get(passport.authenticate('github'));

  app.route('/auth/github/callback').get(
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

  app.route('/register').post((req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, function(err, user) {
      if (err)
        next(err);
      else if (user)
        res.redirect('/');
      else {
        myDataBase.insertOne({
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, 12)
        },
          (err, doc) => {
            if (err)
              res.redirect('/');
            else
              // The inserted document is held within the ops property of the doc
              next(null, doc.ops[0]);
          }
        )
      }
    })
  },
  passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

};
