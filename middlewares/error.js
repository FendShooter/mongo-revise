const { ErrorHandler } = require('../helper/errorHandler');

exports.errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError')
    error = new ErrorHandler('Movie not found', 404);
  if (err.code === 11000)
    error = new ErrorHandler('Duplicate field value', 404);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((el) => el.message);
    error = new ErrorHandler(message, 400);
  }
  res.status(error.statusCode || 500).json({
    status: error.status || 'fail',
    message: error.message,
    name: error.name,
  });
  next();
};
