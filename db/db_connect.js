require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const db_connect = async () => {
  try {
    const conn = mongoose.connect(process.env.CONNECTION_URI);

    console.log(`Mongodb running on ${(await conn).connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = { db_connect };
