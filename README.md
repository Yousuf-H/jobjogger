# JobJogger

A full-stack job application tracker built as a portfolio project. Track every application, monitor your pipeline, and save jobs from Seek in one click with the Chrome extension.

**Live:** [jobjogger.com](https://jobjogger.com)

---

<img width="1712" height="1031" alt="Screenshot 2026-04-07 at 5 18 37 PM" src="https://github.com/user-attachments/assets/684a03e9-d864-43b5-997e-b0c01cdd1b48" />


---

## Features

- **Job tracking** — manage applications across statuses: wishlist, applied, phone screen, interviewing, offer, accepted, rejected, ghosted, withdrawn
- **Timeline** — every status change, interview, note, and follow-up logged automatically
- **Analytics** — response rates, interview rates, pipeline funnel, source performance, and average time between stages
- **Chrome extension** — extract job details from Seek in one click and save directly to your tracker
- **Demo account** — pre-populated with realistic data, resets daily via scheduled cron job
- **Secure auth** — HttpOnly cookie-based JWT authentication, replacing localStorage token storage

---

## Screenshots

| Dashboard | Job Detail |
|-----------|------------|
| <img width="1712" height="1031" alt="Screenshot 2026-04-07 at 5 18 37 PM" src="https://github.com/user-attachments/assets/306317b8-7eb1-4703-9c45-bd192012cb41" /> | <img width="1710" height="1032" alt="Screenshot 2026-04-07 at 5 25 56 PM" src="https://github.com/user-attachments/assets/deb27742-8b16-43a5-9302-866bc93057af" />|
| Analytics | Chrome Extension |
|-----------|-----------------|
|<img width="1714" height="1032" alt="Screenshot 2026-04-07 at 5 26 43 PM" src="https://github.com/user-attachments/assets/722fc0c2-7e03-421d-a80f-7e4022bf3174" />| <img width="1919" height="995" alt="Screenshot 2026-04-07 at 5 33 13 PM" src="https://github.com/user-attachments/assets/d00abb85-7215-4018-a396-f7a83148c6dd" />|

---

## Tech Stack

### Backend (`jobjogger_api`)
- **Ruby on Rails 8.1** — API-only
- **PostgreSQL** — primary database
- **Devise** — authentication base
- **Active Storage** — avatar uploads
- **Rack::Attack** — rate limiting and bot protection

### Frontend (`jobjogger_web`)
- **React 19** + **TypeScript**
- **Vite** — build tool
- **TanStack Query** — server state management
- **TanStack Table** — job list table
- **shadcn/ui** + **Radix UI** — component library
- **Recharts** — analytics charts
- **Tailwind CSS** — styling
- **Framer Motion** — animations

### Chrome Extension (`jobjogger_extension`)
- **Manifest V3**
- **TypeScript** + **esbuild**
- **Turndown** — HTML to Markdown conversion for job descriptions
- Seek job extractor with duplicate detection

### Infrastructure
- **Render** — API and cron job hosting
- **Cloudflare** — DNS
- **Namecheap** — domain (`jobjogger.com`)

---

## Architecture

JobJogger is a monorepo with three independent packages:

**API** (`jobjogger_api`) — Rails API-only app serving JSON. Handles auth,
job data, analytics, and file uploads via Active Storage. Deployed on Render.

**Web** (`jobjogger_web`) — React SPA communicating with the API via Axios.
Auth state is maintained via HttpOnly cookie.

**Extension** (`jobjogger_extension`) — Chrome Manifest V3 extension that
scrapes Seek job listings and saves them to the API using the same HttpOnly
cookie session as the web app. Uses Turndown to convert HTML job descriptions
to Markdown before saving.

**Auth flow:**
1. User signs in → Rails sets HttpOnly JWT cookie on `api.jobjogger.com`
2. Browser automatically sends cookie on every subsequent API request
3. Extension uses `credentials: include` so the same cookie is sent from Seek pages
4. Demo sessions follow the same flow via `POST /api/v1/demo/session`

---

## Security

- **HttpOnly cookies** — JWT stored in HttpOnly cookies, not localStorage, preventing XSS token theft
- **Rack::Attack** — rate limiting on auth endpoints (5 requests per 20 seconds), global throttle (300 per 5 minutes)
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Content-Security-Policy`
- **Demo account restrictions** — backend-enforced, cannot modify profile or exceed 20 jobs
- **Sensitive param filtering** — passwords, tokens, and credentials filtered from logs

---

## Local Development

### Prerequisites
- Ruby 4.0.1
- Node.js 20+
- PostgreSQL
- Chrome (for extension development)

### API setup

```bash
cd jobjogger_api
bundle install
cp .env.example .env        # add your env vars
rails db:create db:migrate
rails db:seed               # development only
rails s
```

### Web setup

```bash
cd jobjogger_web
npm install
cp .env.example .env        # set VITE_API_BASE_URL
npm run dev
```

### Extension setup

```bash
cd jobjogger_extension
npm install
npm run build
```

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked → select `jobjogger_extension/`

### Demo account (development)

```bash
cd jobjogger_api
rails demo:create   # creates the demo user
rails demo:reset    # seeds demo jobs and timeline entries
```

---

## Demo Account

The live demo at [jobjogger.com](https://jobjogger.com) includes a pre-populated demo account with realistic job application data across all statuses. A Render cron job resets the demo data daily at midnight UTC.

---

## Chrome Extension

The JobJogger Chrome extension lets you save jobs from Seek in one click.

- Extracts job title, company, location, salary, employment type, and full job description
- Converts HTML job descriptions to clean Markdown automatically
- Detects duplicate jobs before saving
- Shows which JobJogger account you're signed in as

*(pending review)*

---

## CI/CD

GitHub Actions runs on every push to `main`:
- **RuboCop** — Ruby linting
- **RSpec** — Rails test suite
- **ESLint** — TypeScript linting
- **TypeScript** — type checking

Passing CI triggers automatic deployment to Render.

---

## Author

**Yousuf Hassan** — Junior Full Stack Developer based in Melbourne, Australia.

[GitHub](https://github.com/Yousuf-H) · [LinkedIn](https://www.linkedin.com/in/yousufh-dev/)
