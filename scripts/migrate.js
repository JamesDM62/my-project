const path = require('path');
const envPath = path.resolve(__dirname, '../backend/.env'); // ✅ correct location
console.log('Looking for .env at:', envPath);

require('dotenv').config({ path: envPath });
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);


const { sequelize } = require(path.resolve(__dirname, '../backend/db/models'));

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced to taste_of_home schema');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await sequelize.close();
  }
})();

