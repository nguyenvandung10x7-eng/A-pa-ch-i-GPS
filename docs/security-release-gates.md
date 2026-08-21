# Security release gates

## Tracked-secret scan

The repository runs `.github/workflows/secret-scan.yml` on every pull request and on pushes to `main`.

The gate rejects:

- tracked `.env` / `.env.*` files;
- PEM private-key blocks;
- common GitHub, AWS and Slack credential formats;
- committed values assigned to high-risk production variables such as `SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_ROLE_KEY`, `DATABASE_URL` and `POSTGRES_PASSWORD`.

The scan intentionally checks tracked repository text, not Netlify or Supabase secret stores. Production environment values must remain in the deployment/provider secret configuration and still require a separate production configuration check before launch.

If the gate finds a real credential, remove it from the tracked tree and rotate/revoke it. Do not merely add the file to `.gitignore` after it has already been committed.
