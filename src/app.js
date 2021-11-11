const cookieParser = require('cookie-parser');
const debug = require('debug')('http');
const responseTime = require('response-time');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const authRoute = require('./routes/authRoute');
const linksRoute = require('./routes/linksRoute');
const itemsRoute = require('./routes/itemsRoute');
const catalogRoute = require('./routes/catalogRoute');
const imagesRoute = require('./routes/imagesRoute');
const headerRoute = require('./routes/headerRoute');
const urlRoute = require('./routes/urlRoute');
const userRoute = require('./routes/userRoute');
const storeRoute = require('./routes/storeRoute');
const verifyAuth = require('./middlewares/verifyAuth');

const app = express();

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://goodz.id'
        : ['http://localhost:3000'],
  })
);
app.use(responseTime({ digits: 0 }));
app.use(
  responseTime((req, res, time) => {
    const formattedTime = `${Math.ceil(time)}ms`;
    debug(`${req.method} ${req.originalUrl} ${formattedTime}`);
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoute);
app.use('/url', urlRoute);
app.use('/images', imagesRoute);
app.use('/user', verifyAuth, userRoute);
app.use('/store', verifyAuth, storeRoute);
app.use('/links', verifyAuth, linksRoute);
app.use('/items', verifyAuth, itemsRoute);
app.use('/catalog', verifyAuth, catalogRoute);
app.use('/header', verifyAuth, headerRoute);

module.exports = app;
