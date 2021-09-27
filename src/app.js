require('dotenv').config({ path: `../.env.${process.env.NODE_ENV}` });
const express = require('express');
const helmet = require('helmet');
const { sequelize } = require('./models');

const app = express();

app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}...`);
  await sequelize.sync({ alter: true });
  console.log('Database connected!');
});
