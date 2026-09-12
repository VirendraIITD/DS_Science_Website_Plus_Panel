# Go-live checklist — Supabase (database) + client's server (app)

The app is a running Node.js service, not a folder of HTML files, so it needs a
machine to run on. Supabase supplies the PostgreSQL database; the client's
server runs the app; the client's domain points at that server.

```
  Visitor
     │  https://dsscienceacademy.com
     ▼
  Client's server ──── Nginx/Caddy (TLS) ──── Docker: Next.js app :3100
     │
     │  postgresql://…pooler.supabase.com:6543
     ▼
  Supabase Postgres
```

Roughly two hours end to end, most of it waiting for DNS.

---

## What to collect from the client first

| Item | Where it goes |
|---|---|
| Domain + registrar login (or DNS access) | Step 2 |
| Server IP, SSH user, password or key | Step 3 |
| Supabase account — **created in DS's own name** | Step 1 |
| Office email for enquiry alerts | Step 6 |
| WhatsApp number for click-to-chat | Step 6 |

> The Supabase account must belong to DS, not to us. PRD §2 requires the data to
> live in DS's own instance; a Supabase project under our account would break
> that and make handover messy.

---

## Step 1 — Supabase project

1. Sign in at supabase.com with the **client's** account.
2. **New project.** Name `ds-academy`, region **Mumbai (ap-south-1)** — nearest
   to Rajasthan, roughly 30–40 ms instead of 250 ms from a US region.
3. Set a strong database password. Save it; Supabase does not show it again.
4. Pick a **paid plan**, not Free. Free projects pause after a week of
   inactivity, and a paused database means a dead website at 2 a.m.
5. Wait for provisioning (~2 minutes).
6. Open **Connect** (top bar) and copy two strings:
   - **Transaction pooler**, port `6543` → this is `DATABASE_URL`
   - **Session pooler**, port `5432` → this is `DIRECT_URL`
7. Append `?pgbouncer=true&connection_limit=1` to the `6543` one.

Nothing else in Supabase needs configuring. We do not use Supabase Auth,
Storage or RLS — the app has its own login, and Prisma creates the tables.

---

## Step 2 — DNS

At the client's registrar (GoDaddy, Hostinger, BigRock…), add:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `<server IP>` | 300 |
| A | `www` | `<server IP>` | 300 |

Do this early — propagation takes 15 minutes to a few hours, and TLS in
step 7 will not work until it has landed.

Check from your machine:

```bash
nslookup dsscienceacademy.com
```

---

## Step 3 — Prepare the server

SSH in, then:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Log out and back in so the group takes effect.

Firewall — only 22, 80 and 443 open. Port 3100 stays private; the proxy reaches
it over localhost.

```bash
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
```

---

## Step 4 — Put the code on the server

```bash
sudo mkdir -p /opt/ds-academy && sudo chown $USER /opt/ds-academy
cd /opt/ds-academy
```

Then either `git clone <repo> .`, or from your own machine:

```bash
rsync -av --exclude node_modules --exclude .next \
  ./ds-academy-web/ user@<server-ip>:/opt/ds-academy/
```

---

## Step 5 — Remove the bundled database

`docker-compose.yml` ships a local Postgres for development. With Supabase it is
redundant. Delete the `db:` service, the `depends_on:` block, the `db_data`
volume, and the two `DATABASE_URL`/`DIRECT_URL` lines under `environment:` —
those values now come from `.env`.

Keep the `uploads` volume. Photos and PDFs stay on the server's disk; only the
database moves to Supabase.

---

## Step 6 — Configure

```bash
cp .env.example .env
openssl rand -base64 48        # copy the output for AUTH_SECRET
nano .env
```

The lines that must be right before going live:

```ini
SITE_TIER=elite
DATABASE_URL="postgresql://postgres.<ref>:<pw>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<pw>@<region>.pooler.supabase.com:5432/postgres"
AUTH_SECRET="<the 48-byte string>"
NEXT_PUBLIC_SITE_URL="https://dsscienceacademy.com"
SEED_ADMIN_EMAIL="office@dsscienceacademy.com"
SEED_ADMIN_PASSWORD="<strong temporary password>"
ENQUIRY_NOTIFY_TO="office@dsscienceacademy.com"
NEXT_PUBLIC_WHATSAPP_NUMBER="91XXXXXXXXXX"
```

Lock the file down — it holds the database password:

```bash
chmod 600 .env
```

---

## Step 7 — Build, migrate, seed

> **Prerequisite, once per project.** `migrate deploy` only *applies* migration
> files — it cannot invent them. Generate them on a development machine first
> and commit the `prisma/migrations/` folder:
>
> ```bash
> npx prisma migrate dev --name init
> ```
>
> Skip this and step 7 fails with *"No migration found in prisma/migrations"*.
> (A one-off alternative on the server is `npx prisma db push`, which creates
> the tables without a migration history — fine for a first install, but it
> leaves you no upgrade path later. Prefer the committed migration.)

```bash
docker compose up -d --build          # first build ~3–5 minutes
docker compose exec web npx prisma migrate deploy
docker compose exec web npm run db:seed
curl -s localhost:3100/api/health     # expect {"ok":true,"db":"up"}
```

`migrate deploy` creates all 26 tables in Supabase. Confirm in Supabase ›
Table Editor if you want to see them.

If health returns `db: down`, the connection string is wrong — check the
password has no unescaped `@` or `#` (URL-encode them: `%40`, `%23`).

---

## Step 8 — Domain and HTTPS

Caddy is the shorter path; it fetches and renews certificates on its own.

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

```
dsscienceacademy.com, www.dsscienceacademy.com {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3100
}
```

```bash
sudo systemctl reload caddy
```

For Nginx + certbot instead, see SETUP.md §5. Either way the proxy **must**
forward `X-Forwarded-For`, or the form rate-limiter sees every visitor as one IP
and locks the enquiry form.

Open `https://dsscienceacademy.com`. The site is live.

---

## Step 9 — First login and content

1. `https://dsscienceacademy.com/admin`
2. Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
3. **Change that password now.**
4. **Settings** — real name, address, phone numbers, WhatsApp, emails, logo,
   brand colours, SEO title and description, Google Maps embed.
5. Replace the seeded sample content with the client's own: Toppers, Faculty,
   Courses, News, Banners, Downloads, Gallery.
6. Send a test enquiry from the public form and confirm it appears under
   Enquiries.

---

## Step 10 — Backups

Supabase takes daily backups on paid plans, but keep your own copy too — a
backup you cannot restore without the vendor is only half a backup.

```bash
sudo tee /etc/cron.daily/ds-academy-backup >/dev/null <<'EOF'
#!/bin/sh
cd /opt/ds-academy
set -a; . ./.env; set +a
docker compose exec -T web npx prisma db execute --stdin <<'SQL' >/dev/null 2>&1
SELECT 1;
SQL
pg_dump "$DIRECT_URL" | gzip > /opt/ds-academy/backups/db-$(date +%F).sql.gz
find /opt/ds-academy/backups -name 'db-*.sql.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/ds-academy-backup
mkdir -p /opt/ds-academy/backups
```

`pg_dump` needs the client tools on the host: `sudo apt install -y postgresql-client`.

Uploads live in a Docker volume — back that up as well:

```bash
docker run --rm -v ds-academy_uploads:/data -v /opt/ds-academy/backups:/out alpine \
  tar czf /out/uploads-$(date +%F).tar.gz -C /data .
```

Copy `/opt/ds-academy/backups` off the server on a schedule.

---

## Step 11 — Google

- **Search Console** — add the property, put the verification string in
  `NEXT_PUBLIC_GSC_VERIFICATION`, rebuild, verify, then submit
  `https://dsscienceacademy.com/sitemap.xml`.
- **Analytics** — set `NEXT_PUBLIC_GA_ID=G-XXXXXXX`, rebuild.
- **Business Profile** — the Contact page already emits
  `EducationalOrganization` schema with the address, which feeds local search.

Rebuild after either change: `docker compose up -d --build`.

---

## Handover to DS

- Admin URL, email and the password they chose
- Supabase login (already theirs)
- Server IP and SSH access
- `STAFF_GUIDE.md`, printed or emailed
- Where the backups land and how to restore one

---

## Later: Elite → Pro

```bash
cd /opt/ds-academy
sed -i 's/^SITE_TIER=elite/SITE_TIER=pro/' .env
docker compose up -d
```

No migration, no rebuild of the database. The Pro tables are already there; the
modules simply appear.

---

## Common snags

| Symptom | Cause | Fix |
|---|---|---|
| `prepared statement "s0" already exists` | `?pgbouncer=true` missing from `DATABASE_URL` | Add it, restart |
| `migrate deploy` hangs or errors on locks | Migrating through the 6543 pooler | Migrations must use `DIRECT_URL` (5432) |
| `Can't reach database server` | Password has raw `@` / `#`, or the project is paused | URL-encode; check the Supabase dashboard |
| Site loads, panel loops back to login | Cookie is `secure` but the site is on plain HTTP | Finish the TLS setup in step 8 |
| "Too many enquiries" on the form | `X-Forwarded-For` not forwarded | Fix the proxy config |
| Too many connections after a few days | `connection_limit=1` missing | Add it to the pooled URL |
| Uploads vanish after `docker compose up --build` | `uploads` volume removed in step 5 | Restore it in `docker-compose.yml` |
