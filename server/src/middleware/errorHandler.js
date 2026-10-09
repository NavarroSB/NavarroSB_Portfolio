export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return _next(error);
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }
  return res.status(500).json({ message: 'Internal server error.' });
}
