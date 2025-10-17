import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

// Configure via environment variables
const JWKS_URI = process.env.JWKS_URI || '';
const AUDIENCE = process.env.AUTH_AUDIENCE || '';
const ISSUER = process.env.AUTH_ISSUER || '';

if (!JWKS_URI) {
  console.warn('JWKS_URI not set; JWT validation middleware will reject tokens');
}

export const jwtMiddleware = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: JWKS_URI,
  }) as any,
  audience: AUDIENCE || undefined,
  issuer: ISSUER || undefined,
  algorithms: ['RS256'],
  credentialsRequired: true,
});

export function optionalJwtMiddleware() {
  // wrapper to allow missing token
  return (req: any, res: any, next: any) => {
    const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!auth) return next();
    return jwtMiddleware(req, res, next);
  };
}
