# memento

A memory app: capture links, notes and screenshots in one gesture, add a line about why, and find them again from any device. Installable as a PWA.

Every row carries `user_id` and is protected by row-level security. Sign-in is a temporary email code limited to `ALLOWED_EMAIL`; Google sign-in replaces it next.

## Stack

- **Next.js 16** (App Router, TypeScript), installable PWA, hosted on **Vercel**
- **Supabase**: Postgres (keyword search with prefix matching), Auth, Storage (private `captures` bucket)
- No AI for now. Link previews come from the page's own metadata, fetched server-side behind an SSRF guard.
- Design system: `brand/design-system.html` is the spec; `src/styles/` ports it 1:1

## Layout

```
brand/                  brand kit + design-system spec (static, not part of the app build)
src/app/                routes: (marketing)/ landing, (app)/ signed-in app, demo/ public demo, login/, api/cron/
src/components/views/   screens shared by the live app and the demo (feed, detail, projects, search)
src/components/app/     AppApi contract + live (Supabase) and demo (in-browser) providers
src/styles/             tokens.css, components.css (ported from the spec), shell.css, fonts.css
src/lib/supabase/       server / browser / proxy clients
src/proxy.ts            refreshes the session, redirects signed-out visitors to /login
supabase/migrations/    SQL schema (RLS on every table)
```

## One-time setup

### 1. Supabase

1. Create a project (region close to you, e.g. `eu-central-1`).
2. Run every file in `supabase/migrations/` in name order (SQL editor, or `supabase db push`).
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

## Demo

`/demo` runs the real app screens on sample data kept in the browser tab (sessionStorage). No sign-in, nothing is saved to an account. It also drives the end-to-end tests.

## Checks

```bash
npm run typecheck   # next typegen + tsc
npm run lint
npm test            # unit tests + every migration and RLS rule in PGlite
npm run build && npm run test:e2e   # Playwright: public pages and the /demo flows
```

CI (`.github/workflows/ci.yml`) runs all of these on every push.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| A Live & installable | Settings, nav, 404, loading/error states, PWA offline page, tests + CI | Done |
| B Capture & browse | Capture sheet, link previews, image upload, feed + filters, detail/edit/delete, projects | Done |
| C Find | Prefix search, ⌘K palette | Done |
| Next | Google sign-in, Android share target, iOS Shortcut, offline capture queue, Rediscover | |
