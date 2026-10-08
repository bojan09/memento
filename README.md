# memento

A personal memory app: capture links, notes and screenshots in one gesture; AI summarises, tags and connects them; search and ask questions over everything you saved.

Single user by design (sign-ups are off), but every row carries `user_id` and is protected by row-level security.

## Stack

- **Next.js 16** (App Router, TypeScript), installable PWA, hosted on **Vercel**
- **Supabase**: Postgres (+ pgvector from P3), Auth (email code), Storage
- **Claude** Haiku 5.5 for understanding, Opus 5.5 for Ask (from P2/P3); **Voyage** embeddings (P3)
- Design system: `brand/design-system.html` is the spec; `src/styles/` ports it 1:1

## Layout

```
brand/                  brand kit + design-system spec (static, not part of the app build)
src/app/                routes: (app)/ is the signed-in shell, login/, api/cron/
src/styles/             tokens.css, components.css (ported from the spec), shell.css, fonts.css
src/lib/supabase/       server / browser / proxy clients
src/proxy.ts            refreshes the session, redirects signed-out visitors to /login
supabase/migrations/    SQL schema (RLS on every table)
```

## One-time setup

### 1. Supabase

1. Create a project (region close to you, e.g. `eu-central-1`).
2. Run `supabase/migrations/20261008000000_init.sql` (SQL editor, or `supabase db push`).
3. **Authentication > Sign In / Providers > Email**: keep Email enabled, turn **off** "Allow new users to sign up".
4. **Authentication > Users > Add user**: create your own user with your email (auto-confirm).
5. **Authentication > Emails > Magic Link** template: the app signs in with a typed code, so the email must show it. Replace the body with:
   ```html
   <h2>Your memento code</h2>
   <p>Enter this code to sign in: <strong>{{ .Token }}</strong></p>
   <p>It expires in an hour. If you didn't ask for it, ignore this email.</p>
   ```
   Why a code and not a link: an installed iPhone web app keeps its own cookies, separate from Safari. A tapped link would sign you in to Safari, not the app.
6. **Settings > API Keys**: copy the project URL and the publishable key.

### 2. Vercel

1. Import this GitHub repo as a new project (framework: Next.js, defaults are fine).
2. Add the environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `ALLOWED_EMAIL`: your email, the only address that can request a code
   - `CRON_SECRET`: a long random string (`openssl rand -hex 32`)
3. Deploy. `vercel.json` schedules `/api/cron/keepalive` daily so the free Supabase project isn't paused for inactivity.
4. In Supabase **Authentication > URL Configuration**, set the Site URL to the Vercel production URL.

### 3. Local development

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```

## Checks

```bash
npx next typegen && npx tsc --noEmit   # types
npm run lint
npm run build
```

## Roadmap

| Phase | Scope |
|---|---|
| P0 Foundation | Shell, tokens, fonts, icons, manifest, email-code auth, schema + RLS, keep-alive cron |
| P1 Capture & browse | Capture sheet, feed, memory cards, edit/delete, projects, filters |
| P2 Understanding | Link fetch + extraction, summary, tags, "why" guess with provenance, card states |
| P3 Search & Ask | ⌘K palette, hybrid search, Ask My Knowledge with citations |
| P4 Daily habit | Android share target, iOS Shortcut, Rediscover, offline capture queue |
