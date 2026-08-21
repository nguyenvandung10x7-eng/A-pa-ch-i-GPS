# Security release gates

## Tracked-secret scan

The repository runs `.github/workflows/secret-scan.yml` on every pull request and on pushes to `main`.

The gate has two parts:

- a repository-specific rule that rejects tracked `.env` / `.env.*` files, while allowing `.env.example`, `.env.sample`, and `.env.template`;
- Gitleaks scanning of the checked-out Git history for supported secret patterns.

The workflow intentionally does not implement its own YAML, JSON, shell, or text-encoding parser. Secret-pattern coverage is delegated to Gitleaks, while the repository-specific `.env` filename rule remains explicit and auditable.

Both `actions/checkout` and `gitleaks/gitleaks-action` are pinned to exact commit SHAs in the workflow rather than floating tags.

This gate does not inspect Netlify, Supabase, or other provider-side secret stores. Production environment values must remain in deployment/provider secret configuration and still require a separate production configuration check before launch.

If the gate finds a real credential, remove it from the tracked tree/history as appropriate and rotate or revoke it. Do not merely add the file to `.gitignore` after it has already been committed.
