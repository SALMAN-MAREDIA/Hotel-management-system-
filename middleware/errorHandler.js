function notFound(req, res) {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    errorCode: 404,
    errorMessage: 'The page you are looking for does not exist.',
    currentPage: ''
  });
}

function errorHandler(err, req, res, _next) {
  console.error('Error:', err.stack || err.message || err);
  const statusCode = err.status || 500;
  res.status(statusCode).render('error', {
    title: `${statusCode} - Error`,
    errorCode: statusCode,
    errorMessage: statusCode === 500 ? 'Something went wrong on our end. Please try again later.' : err.message,
    currentPage: ''
  });
}

module.exports = { notFound, errorHandler };
