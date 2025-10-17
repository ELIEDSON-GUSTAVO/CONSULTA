Autenticação JWT via JWKS

Instruções rápidas:

Variáveis de ambiente necessárias:
- JWKS_URI: URL do endpoint JWKS (ex: https://api.stack-auth.com/.../.well-known/jwks.json)
- AUTH_AUDIENCE: audience esperado no token (opcional)
- AUTH_ISSUER: issuer esperado no token (opcional)

Instalação (local):

```bash
npm install
npm install express-jwt jwks-rsa
```

Uso:
- O middleware `jwtMiddleware` está em `server/middleware/auth.ts` e aplica validação em rotas protegidas.
- Rotas que modificam dados (POST/PATCH/DELETE) foram protegidas com `jwtMiddleware`.

Notas:
- Se você precisa permitir requisições sem token em algumas rotas, use `optionalJwtMiddleware()`.
- No Render/Produção, configure `JWKS_URI`, `AUTH_AUDIENCE` e `AUTH_ISSUER` em Environment.
