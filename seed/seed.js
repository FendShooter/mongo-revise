const fs = require('fs');
const mongoose = require('mongoose');
const { Movie } = require('../models/Movies');
require('dotenv').config({ path: '../config/config.env' });
mongoose.connect('mongodb://localhost:27017/train-db').then((_) => {
  console.log('connected');
});

let file = fs.readFileSync(`${process.cwd()}/data/data.json`, 'utf-8');
const transformed = JSON.parse(file);

async function feedSeed() {
  try {
    const movies = await Movie.create(transformed.movies);
    if (movies) {
      console.log(`${movies.length} was imported`);
      process.exit(1);
    }
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}
async function deleteData() {
  try {
    const movies = await Movie.deleteMany();

    if (movies.deletedCount > 0) {
      console.log('Data deleted...');
    }
    process.exit(1);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

if (process.argv[2] === '-import') {
  feedSeed();
}
if (process.argv[2] === '-delete') {
  deleteData();
}
