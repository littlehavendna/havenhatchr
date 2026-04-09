# Security Checklist

Use this checklist before major launches or production releases.

- Confirm `DATABASE_URL`, Stripe variables, and `NEXT_PUBLIC_APP_URL` are present in Railway.
- Confirm production uses `npm run railway:build` and `npm run railway:start`.
- Confirm `prisma migrate deploy` succeeds before the app starts.
- Verify Stripe webhook endpoint points to `/api/stripe/webhook` and uses the correct signing secret.
- Review admin users and remove admin access that is no longer needed.
- Confirm beta and founder access flags are still intentional.
- Review recent audit logs for admin access, billing, and support actions.
- Verify public URLs remain limited to `/` and `/pricing` in `robots.txt` and `sitemap.xml`.
- Test login, signup, logout, checkout, portal, and cancel flows with production-like env vars.
- Confirm private routes return `noindex` and require auth.
- Confirm `/admin` routes require an admin account.
- Rotate compromised secrets immediately and redeploy after env changes.

Future hardening still recommended:
- move rate limiting from in-memory process state to a shared datastore or edge service
- add automated security tests for auth, admin access, and CSRF/origin enforcement
- add centralized structured logging/monitoring and alerting outside app logs
- add secret rotation runbooks and periodic dependency review
