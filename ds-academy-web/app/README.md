# DS Science Academy — Website + Admin Panel

A standalone marketing website and CMS for DS Science Academy, Gangapur City.
Built to the spec in `../DS_Website_Panel_PRD.docx`.

**This app is self-contained.** It has no dependency on Mentora's app, API or
database, and runs entirely on DS's own domain, server and PostgreSQL instance
(PRD §2).

---

## Tiers

One codebase serves both commercial tiers. `SITE_TIER` in `.env` decides which:

| `SITE_TIER` | What you get |
|---|---|
| `elite` | Public website + admin panel with 11 managers, enquiries and CSV export |
| `pro` | Everything above **plus** Analytics, Lead CRM, Course Packages, Rank Predictor, Demo Bookings, Broadcast, Blog, FAQ, Multi-branch and Staff/Roles |

Upgrading Elite → Pro is a one-line env change and a restart. No migration, no
rewrite — the Pro tables ship in the schema either way, and the modules are
hidden rather than absent.

---

## Stack

- **Next.js 14** (App Router) — public pages server-rendered for SEO, panel under `/admin`
- **PostgreSQL + Prisma** — typed schema and migrations
- **Tailwind CSS** — styled to the approved prototypes (`../ds_panel_elite.html`, `../ds_panel_pro.html`)
- **Credentials auth** — bcrypt hashes, JWT session cookie backed by a revocable `Session` row
- **Docker** — multi-stage build, behind Nginx or Caddy for TLS

No paid service is required to run it. Email, WhatsApp/SMS broadcast and Google
Analytics are all optional and degrade quietly when unconfigured.

---

## Quick start (local)

```bash
cp .env.example .env      # then fill in DATABASE_URL and AUTH_SECRET
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

- Website → http://localhost:3100
- Panel → http://localhost:3100/admin (credentials printed by the seed)

Generate a secret with `openssl rand -base64 48`.

---

## Production

See [SETUP.md](./SETUP.md) for the full server walkthrough — Docker, Nginx,
Let's Encrypt, backups.

Hand [STAFF_GUIDE.md](./STAFF_GUIDE.md) to the office staff; it is written for
someone who has never used a CMS.

---

## Project layout

```
prisma/
  schema.prisma        18 entities, PRD §5
  seed.ts              admin account + starter content
src/
  app/
    (site)/            public website
    admin/             admin panel
    api/               REST endpoints
    sitemap.ts         SEO
  components/
    admin/             panel UI — ResourceManager drives ~15 of the managers
    site/              public UI
    ui/                shared primitives
  lib/
    tier.ts            Elite/Pro gating
    rbac.ts            role permissions
    resources.ts       the CRUD registry the generic API routes read
    predictor.ts       rank → college bucketing
```

### How the panel avoids 20 copies of the same screen

Most managers are a table plus a modal form. `src/lib/resources.ts` registers
each one (Prisma model, Zod schema, permission, ordering, search columns), and
a single pair of routes — `/api/admin/[resource]` and
`/api/admin/[resource]/[id]` — serves them all. On the page side,
`<ResourceManager>` takes a field list and a column list.

Adding a manager is one registry entry plus one page. Modules with their own
shape — CRM kanban, Packages cards, Gallery grid, Broadcast, Settings — are
written out in full, because forcing them through the generic path would have
cost more than it saved.

---

## Out of scope

Per PRD §13: question bank, online test portal, LMS, attendance, parent login
and fee payment are **not** part of this build. The panel shows a deliberately
non-functional "Tests / QBM — Coming in Phase 2" tab, and nothing behind it.
