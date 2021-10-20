const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const authRoute = require('./routes/authRoute');
const linksRoute = require('./routes/linksRoute');
const itemsRoute = require('./routes/itemsRoute');
const catalogRoute = require('./routes/catalogRoute');
const imagesRoute = require('./routes/imagesRoute');
const headerRoute = require('./routes/headerRoute');
const storeRoute = require('./routes/storeRoute');
const verifyAuth = require('./middlewares/verifyAuth');

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoute);
app.use('/store', storeRoute);
app.use('/links', verifyAuth, linksRoute);
app.use('/items', verifyAuth, itemsRoute);
app.use('/catalog', verifyAuth, catalogRoute);
app.use('/images', verifyAuth, imagesRoute);
app.use('/header', verifyAuth, headerRoute);

module.exports = app;
