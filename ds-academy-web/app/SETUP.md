# Deployment guide — DS Science Academy

For whoever puts this on DS's server. Assumes Ubuntu 22.04 or similar, a domain
pointed at the server, and root or sudo access.

Everything below runs on **DS's own infrastructure** (PRD §2, §10).

---

## 1. What DS provides

| Item | Notes |
|---|---|
| Domain | e.g. `dsscienceacademy.com`, with an A record on the server's IP |
| Server | 2 vCPU / 4 GB RAM is comfortable; 1 vCPU / 2 GB works |
| Database | The Compose file includes PostgreSQL 16; a managed instance is fine too |
| Email (optional) | SMTP host, port, user and password for enquiry notifications |
| WhatsApp/SMS (optional, Pro) | Gateway API URL and key for Broadcast |

---

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out and back in
```

---

## 3. Get the code and configure

```bash
sudo mkdir -p /opt/ds-academy && sudo chown $USER /opt/ds-academy
cd /opt/ds-academy
# copy the delivered source here, then:
cp .env.example .env
```

Edit `.env`. The values that must change before going live:

```ini
SITE_TIER=elite                 # or "pro"
AUTH_SECRET=<openssl rand -base64 48>
POSTGRES_PASSWORD=<a long random password>
NEXT_PUBLIC_SITE_URL=https://dsscienceacademy.com
SEED_ADMIN_EMAIL=office@dsscienceacademy.com
SEED_ADMIN_PASSWORD=<a strong temporary password>
ENQUIRY_NOTIFY_TO=office@dsscienceacademy.com
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
```

`DATABASE_URL` is assembled by `docker-compose.yml` from the Postgres
variables — leave it alone unless you are using a managed database, in which
case set it in `.env` and delete the `db` service.

> **Never commit `.env`.** It is already in `.gitignore` (PRD §9).

---

## 4. Start it

> **Once per project, before the first deploy:** run `npx prisma migrate dev
> --name init` on a development machine and commit the generated
> `prisma/migrations/` folder. `npm run setup` applies migrations; it cannot
> create them, and fails with *"No migration found"* if the folder is absent.

```bash
docker compose up -d --build
docker compose exec web npm run setup     # migrations + seed, run once
docker compose logs -f web                # watch it come up
```

The app listens on `127.0.0.1:3100` — not on the public interface. The reverse
proxy is what the world talks to.

Check it is alive:

```bash
curl -s localhost:3100/api/health
```

---

## 5. Reverse proxy and TLS

### Caddy (simpler — gets certificates automatically)

`/etc/caddy/Caddyfile`:

```
dsscienceacademy.com, www.dsscienceacademy.com {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3100
}
```

```bash
sudo systemctl reload caddy
```

### Nginx + Let's Encrypt

`/etc/nginx/sites-available/ds-academy`:

```nginx
server {
    listen 80;
    server_name dsscienceacademy.com www.dsscienceacademy.com;

    # Brochures and papers can be a few MB.
    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        'upgrade';
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ds-academy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d dsscienceacademy.com -d www.dsscienceacademy.com
```

`X-Forwarded-For` matters: the form rate-limiter reads it. Without it every
visitor looks like the same IP and the anti-spam limit locks the form.

---

## 6. First login

1. Go to `https://dsscienceacademy.com/admin`
2. Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
3. **Change the password immediately** — Pro: Staff & Roles › edit your account.
   Elite: ask the developer to run a password reset, or set a fresh
   `SEED_ADMIN_PASSWORD` and re-run the seed.
4. Fill in Settings — name, address, phones, WhatsApp number, colours, SEO.

---

## 7. Backups

Nightly dump, kept for 14 days:

```bash
sudo tee /etc/cron.daily/ds-academy-backup >/dev/null <<'EOF'
#!/bin/sh
cd /opt/ds-academy
docker compose exec -T db pg_dump -U ds_user ds_academy \
  | gzip > ./backups/db-$(date +%F).sql.gz
find ./backups -name 'db-*.sql.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/ds-academy-backup
```

Uploaded files live in the `uploads` Docker volume — back that up too:

```bash
docker run --rm -v ds-academy_uploads:/data -v $(pwd)/backups:/out alpine \
  tar czf /out/uploads-$(date +%F).tar.gz -C /data .
```

Copy `./backups` off the server. A backup on the same machine is not a backup.

Restore:

```bash
gunzip -c backups/db-2026-08-01.sql.gz \
  | docker compose exec -T db psql -U ds_user ds_academy
```

---

## 8. Updating

```bash
cd /opt/ds-academy
git pull                       # or copy the new source over
docker compose up -d --build
docker compose exec web npx prisma migrate deploy
```

Migrations are additive; existing content is untouched.

---

## 9. Elite → Pro

```bash
sed -i 's/^SITE_TIER=elite/SITE_TIER=pro/' .env
docker compose up -d
```

That is the whole upgrade. The Pro tables already exist, so the modules light up
in the sidebar and the Pro pages start resolving. Optionally set
`BROADCAST_PROVIDER=http`, `BROADCAST_API_URL` and `BROADCAST_API_KEY` to send
real WhatsApp/SMS instead of dry runs.

---

## 10. Google

- **Analytics** — set `NEXT_PUBLIC_GA_ID=G-XXXXXXX`, rebuild.
- **Search Console** — set `NEXT_PUBLIC_GSC_VERIFICATION` to the meta-tag value,
  rebuild, verify, then submit `https://dsscienceacademy.com/sitemap.xml`.
- **Business Profile** — the Contact page already emits
  `EducationalOrganization` schema with the address, which helps local search.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `AUTH_SECRET is missing or too short` | Blank or under 16 chars | Set a real secret, restart |
| Panel redirects to login forever | Cookie is `secure` but the site is on plain HTTP | Finish the TLS setup |
| Enquiry form says "too many" | Rate limit; often a missing `X-Forwarded-For` | Add the proxy header |
| Uploads vanish after a rebuild | Volume not mounted | Check the `uploads` volume in `docker-compose.yml` |
| Emails never arrive | SMTP not set, or nodemailer not installed | Set `SMTP_*`, then `npm i nodemailer` and rebuild |
| Predictor page 404s | Elite tier, or no cut-off rows | Set `SITE_TIER=pro`; load data in Admin › Rank Predictor |

Leads are always stored before any notification is attempted, so a mail outage
never costs an admission.
