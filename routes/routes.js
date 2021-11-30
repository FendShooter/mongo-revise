const express = require('express');
const {
  signup,
  signin,
  restrictTo,
  resetPassword,
  forgotPassword,
  allUsers,
} = require('../controllers/auth.controller');
const {
  getMovies,
  topCurrent,
  deleteMovie,
  addMovie,
  getMovie,
} = require('../controllers/movies.controller');
const { protectedRoute } = require('../middlewares/protectedRoute.middleware');

const router = express();
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/users', allUsers);
router.post('/forgot-password/', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.route('/movies').get(protectedRoute, getMovies);
router.route('/movies').post(addMovie);
router.route('/movies/top-10-2021').get(queryMiddleware, getMovies);

router
  .route('/movies/:id')
  .delete(protectedRoute, restrictTo('admin', 'publisher'), deleteMovie)
  .get(getMovie);

module.exports = router;

function queryMiddleware(req, res, next) {
  req.query.field = 'title, description,votes';
  req.query.year = '2021';
  req.query.sort = '-votes';
  next();
}
