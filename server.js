'use strict';

require('dotenv').config();

const express = require('express');

const session = require('express-session');
const passport = require('passport');
const myDB = require('./connection');
const routes = require('./routes');
const auth = require('./auth');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();

fccTesting(app); //For FCC testing purposes
app.set('view engine', 'pug')
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// const title = "Diego Bandeira — FCC Advanced Node and Express";

myDB(async client => {
  const myDatabase = await client.db('database').collection('users');

  routes(app, myDatabase);

  auth(app, myDatabase);


}).catch(e => {
  app.route('/').get((req, res) => {
    res.render(`${pugTemplate}/index`,
      { title: e, message: 'Unable to login' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
