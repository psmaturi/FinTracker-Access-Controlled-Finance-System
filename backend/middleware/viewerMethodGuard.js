/**
 * Viewers may only use GET (read) across the API, except they may
 * POST/PUT/DELETE their own transactions under /api/transactions (ownership enforced in controllers).
 * Public POST /api/auth/register and /api/auth/login are always allowed without a user.
 */
function viewerMethodGuard(req, res, next) {
  const method = req.method;
  if (method === "OPTIONS" || method === "HEAD") {
    return next();
  }

  const path = req.originalUrl.split("?")[0];

  if (path === "/" && method === "GET") {
    return next();
  }

  const publicAuthPost =
    (path === "/api/auth/register" || path === "/api/auth/login") && method === "POST";
  if (publicAuthPost) {
    return next();
  }

  if (!req.user) {
    return next();
  }

  if (req.user.role !== "viewer") {
    return next();
  }

  if (method === "GET") {
    return next();
  }

  const transactionWrite =
    (method === "POST" && path === "/api/transactions") ||
    (["PUT", "PATCH", "DELETE"].includes(method) &&
      /^\/api\/transactions\/[^/]+$/.test(path));

  if (transactionWrite) {
    return next();
  }

  return res.status(403).json({
    message:
      "Read-only role: only GET requests are allowed, except creating or updating your own transactions.",
  });
}

module.exports = { viewerMethodGuard };
