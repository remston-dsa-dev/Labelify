# Supabase CLI (Labelify)

The CLI is installed as a **dev dependency**. Use `npm run …` from the repo root (do not run bare `supabase` unless it is on your PATH).

## One-time: login and link

1. **Login** (opens browser / verification code):

   ```bash
   npm run db:login
   ```

2. **Link** this folder to your hosted project (use your project ref from the Supabase dashboard URL):

   ```bash
   npm run db:link -- --project-ref wltaxkmuxuopfllsedrs
   ```

   Run this **after** login succeeds. If `link` fails, `db:push` will say “Cannot find project ref”.

3. **Apply migrations** to the remote database:

   ```bash
   npm run db:push
   ```

## Alternative (no CLI)

Dashboard → **SQL Editor** → paste `migrations/20260415120000_skus.sql` → **Run**.

## Shell quirks

- Paste **one command per line**. Lines starting with `#` are comments in scripts; pasted alone in zsh can cause errors.
- If you copy a block that includes `#`, do not execute the `#` lines as commands.
