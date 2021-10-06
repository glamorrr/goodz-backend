const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const authRoute = require('./routes/authRoute');
const linksRoute = require('./routes/linksRoute');
const itemsRoute = require('./routes/itemsRoute');
const catalogRoute = require('./routes/catalogRoute');
const verifyAuth = require('./middlewares/verifyAuth');

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoute);
app.use('/links', verifyAuth, linksRoute);
app.use('/items', verifyAuth, itemsRoute);
app.use('/catalog', verifyAuth, catalogRoute);

module.exports = app;
