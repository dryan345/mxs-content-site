// TODO: Conver requires to es6 imports and other es6 stuff.
const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
require('css-modules-require-hook/preset');

// Relative imports
const {router: usersRouter, User} = require('./users');
const {router: uploadsRouter} = require('./uploads');
const {
  PORT,
  DATABASE_URL,
  SECRET,
} = require('./config/app.config');

const serverRenderer = require('./server.jsx');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

const { logger } = require('./config/logger.config');

mongoose.Promise = global.Promise;

if (isProduction) {
  app.use('/static', express.static('build'));
  app.get('*', serverRenderer);
} else {
  const { hmr } = require('./hmr.js');
  // Hot Module Reloading
  hmr(app);
  app.get('*', serverRenderer);
}

//  standard app middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(favicon(path.join(process.cwd(), 'src', 'client', 'assets', 'images', 'favicon.ico')));

// passport init
app.use(passport.initialize());
require('./config/passport')(passport);

app.post('/login', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'missing field in body'});
  }
  const { username, password } = req.body;
  try {
    const user = await User.findOne({username: username}).exec();
    if (!user) {
      return res.status(401).json({message: 'Incorrect username or password'});
    }
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({message: 'Incorrect username or password'});
    }
    const token = jwt.sign(user, SECRET);
    res.cookie('token', `JWT ${token}`, { httpOnly: true, secure: true });
    return res.status(200).json({
      success: true,
      user: user.apiRepr()
    });
  } catch(err) {
    console.log(err); //eslint-disable-line
    res.status(500).json({message: 'Internal server error'});
  }
});

// routers
app.use('/users/', usersRouter);
app.use('/uploads/', uploadsRouter);

// Server start and stop util
let server;

function runServer(databaseUrl) {
  return new Promise((res, rej) => {
    mongoose.connect(databaseUrl, (err) => {
      if (err) {
        return rej(err);
      }
      logger.info(`connected to ${databaseUrl}`);
      server = app.listen(PORT, () => {
        logger.info(`App is listening on port ${PORT}`);
        return res();
      })
        .on('error', (err) => {
          mongoose.disconnect();
          return rej(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => new Promise((res, rej) => {
    logger.info('Closing server.');
    server.close((err) => {
      if (err) {
        return rej(err);
      }
      return res();
    });
  }));
}

runServer(DATABASE_URL).catch(err => logger.error(err));
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => logger.error(err));
}

module.exports = { app, runServer, closeServer };
