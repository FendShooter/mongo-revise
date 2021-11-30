const mongoose = require('mongoose');
const slugify = require('slugify');
const moviesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      index: true,
    },
    year: Number,
    votes: Number,
    genreIds: [Number],
    description: {
      type: String,
    },
    slug: String,
    createtAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

moviesSchema.virtual('moitie').get(function () {
  return this.votes / 2;
});

moviesSchema.pre('save', function (next) {
  const movie = this;
  movie.slug = slugify(movie.title, { lower: true, trim: true });
  next();
});
const Movie = mongoose.model('Movie', moviesSchema);

module.exports = { Movie };
