import { createHash, timingSafeEqual } from 'node:crypto';

export function adminAuth(config) {
  return (req, res, next) => {
    const expectedToken = config.contactAdminToken;
    if (!expectedToken) {
      return res.status(503).json({ message: 'Contact management is not configured.' });
    }

    const authorization = req.get('authorization') ?? '';
    const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
    if (!match) {
      return res.status(401).json({ message: 'Admin authentication required.' });
    }

    const expectedDigest = createHash('sha256').update(expectedToken).digest();
    const suppliedDigest = createHash('sha256').update(match[1]).digest();
    if (!timingSafeEqual(expectedDigest, suppliedDigest)) {
      return res.status(401).json({ message: 'Invalid admin token.' });
    }

    return next();
  };
}
