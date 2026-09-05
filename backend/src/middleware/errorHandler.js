export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry — this record already exists' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}
