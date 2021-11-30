const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { db_connect } = require('./db/db_connect');
const { ErrorHandler } = require('./helper/errorHandler');
const helmet = require('helmet');
const hpp = require('hpp');
const { errorMiddleware } = require('./middlewares/error');
process.on('uncaughtException', (err) => {
  console.log('UncaughtException 💥');
  console.log(err.message);
  process.exit(1);
});
require('dotenv').config({ path: './config/config.env' });
db_connect();
const app = express();
app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip',
});
app.use('/api', limiter);
app.use(mongoSanitize());
app.use(hpp());
app.use(xss());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use('/api/v1', require('./routes/routes'));
app.use('*', (req, res, next) => {
  next(new ErrorHandler('Something went wrong', 400));
});
app.use(errorMiddleware);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
