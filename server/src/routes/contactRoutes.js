import { Router } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

export function createContactRoutes({ clientOrigins, contactHandler, contactLimiter }) {
  const router = Router();
  const allowedOrigins = new Set(clientOrigins);
  const limiter = contactLimiter ?? rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many contact requests. Please try again later.' },
  });

  router.use((req, res, next) => {
    if (req.headers.origin && !allowedOrigins.has(req.headers.origin)) {
      return res.status(403).json({ message: 'Origin not allowed.' });
    }
    return next();
  });
  router.use(cors({ origin: clientOrigins, methods: ['POST'] }));
  router.post('/', limiter, contactHandler);
  return router;
}
