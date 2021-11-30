const { asyncCatch } = require('../helper/asyncCatch');
const { ErrorHandler } = require('../helper/errorHandler');
const { Movie } = require('../models/Movies');

exports.getMovies = asyncCatch(async (req, res, next) => {
  const user = req.user;
  let queryObj = { ...req.query };
  const exludeParams = ['field', 'page', 'limit', 'sort'];
  exludeParams.forEach((elm) => delete queryObj[elm]);
  queryObj = JSON.stringify(queryObj);
  queryObj = queryObj.replace(
    /\b(gte|gt|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  let query = Movie.find(JSON.parse(queryObj));
  // sort
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  } else {
    query = query.sort('-createdAt');
  }

  //field
  if (req.query.field) {
    const fields = req.query.field.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }
  // pagination

  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 100;
  const skip = (page - 1) * limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalCount = await Movie.countDocuments();

  if (req.query.page) {
    query = query.skip(skip).limit(limit);
  }
  const movies = await query;
  if (!movies) {
    return next(new ErrorHandler('no movie found , id well formed', 404));
  }
  const pagination = {};
  if (startIndex > 0) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (endIndex < totalCount) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res
    .status(200)
    .send({
      success: true,
      user,
      pagination,
      count: movies.length,
      data: movies,
    });
});

exports.topCurrent = asyncCatch(async (req, res, next) => {
  const movies = await Movie.find(req.query);
  res.status(200).send({ success: true, count: movies.length, data: movies });
});

exports.addMovie = asyncCatch(async (req, res, next) => {
  const movie = await new Movie(req.body);
  await movie.save();
  res.status(201).send({ success: true, movie });
});
exports.deleteMovie = asyncCatch(async (req, res, next) => {
  const { id } = req.params;

  const user = await Movie.findOne({ _id: id });
  if (!user) {
    return next(new ErrorHandler(`movie not found`, 404));
  }
  await Movie.findByIdAndDelete({ _id: id });
  res
    .status(200)
    .send({ success: true, message: `Movie with ${id} was deleted...` });
});

exports.getMovie = asyncCatch(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return next(new ErrorHandler('no movie found , id well formed', 404));
  }
  res.status(200).json({ success: true, movie });
});