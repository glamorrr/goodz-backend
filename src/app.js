const express = require('express');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoute');

const app = express();

app.use(helmet());
app.use(express.json());

app.use('/auth', authRoutes);

module.exports = app;
