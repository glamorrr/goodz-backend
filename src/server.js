require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    console.log(`Server running on port ${PORT}...`);
    await sequelize.sync({ force: true });
    console.log('Database connected!');
  } catch (err) {
    console.error(err);
  }
});
