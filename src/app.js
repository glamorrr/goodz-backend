const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const authRoute = require('./routes/authRoute');
const linksRoute = require('./routes/linksRoute');

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRoute);
app.use('/links', linksRoute);

module.exports = app;
