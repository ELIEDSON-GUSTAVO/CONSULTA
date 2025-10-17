import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

// Configure via environment variables
const JWKS_URI = process.env.JWKS_URI || '';
const AUDIENCE = process.env.AUTH_AUDIENCE || '';
const ISSUER = process.env.AUTH_ISSUER || '';

if (!JWKS_URI) {
  console.warn('JWKS_URI not set; JWT validation middleware will reject tokens');
}

const client = jwksRsa({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: JWKS_URI,
});

function getKey(header: any, callback: any) {
  if (!header.kid) return callback(new Error('No kid in token header'));
  client.getSigningKey(header.kid, (err: any, key: any) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey ? key.getPublicKey() : key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export function jwtMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);

  jwt.verify(token, getKey, { audience: AUDIENCE || undefined, issuer: ISSUER || undefined, algorithms: ['RS256'] }, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token', details: err.message });
    }
    req.user = decoded;
    next();
  });
}

export function optionalJwtMiddleware() {
  return (req: any, res: any, next: any) => {
    const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!auth) return next();
    return jwtMiddleware(req, res, next);
  };
}
