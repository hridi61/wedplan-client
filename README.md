# WedPlan - Client

Frontend and authentication layer of **WedPlan**, a role-based wedding planning platform. Customers discover wedding services and request bookings, vendors publish services and manage requests (with a Stripe-powered Premium plan), and admins moderate users, services and transactions.

- **Live website:** `https://your-client.vercel.app` _(add after deploying)_
- **Client repository:** `https://github.com/<you>/wedplan-client`
- **Server repository:** `https://github.com/<you>/wedplan-server`

## Important features

- Public home page (hero, featured services, categories, Why WedPlan, How it works) with Framer Motion animation
- Browse Services: search by name, category and location filters, price sorting (asc/desc), pagination, loading and empty states
- Private service details page with image gallery and booking form (redirects to Sign In when signed out)
- Better Auth: email/password and Google sign-in, role selection (customer/vendor), optional profile photo via ImgBB
- Three role-based dashboards with a sidebar: **Customer** (bookings, cancel pending), **Vendor** (services CRUD, booking requests, subscription), **Admin** (users, services moderation, read-only transactions)
- Stripe Checkout subscription for vendors; Premium is activated only by the verified webhook on the server
- Toast notifications, validated forms, error and not-found pages, fully responsive layout

## Technology stack

Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui-style components (Radix Slot + class-variance-authority), Better Auth (JWT plugin), MongoDB, Framer Motion, Sonner, Lucide icons, ImgBB.

## Installation

```bash
git clone https://github.com/<you>/wedplan-client.git
cd wedplan-client
npm install
cp .env.example .env.local   # then fill in the values
```

## Run locally

1. Start the **server** repo first (it listens on `http://localhost:5000`).
2. `npm run dev` and open `http://localhost:3000`.
3. In a second terminal run `npm run seed` once. It creates the admin account, a demo vendor and customer, and sample approved services.

| Role | Email | Password |
| --- | --- | --- |
| Admin | value of `ADMIN_EMAIL` (default `admin@wedplan.com`) | value of `ADMIN_PASSWORD` (default `Admin1234`) |
| Vendor | `vendor@wedplan.com` | `Vendor1234` |
| Customer | `customer@wedplan.com` | `Customer1234` |

Admin accounts cannot be created through sign-up. The seed script promotes the account directly in the database.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Long random secret for Better Auth (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Public origin of this app, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Same origin, exposed to the browser |
| `MONGODB_URI`, `MONGODB_DB` | MongoDB connection string and database name (must match the server) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `IMGBB_API_KEY` | ImgBB key, used only by the server-side `/api/upload` route |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express server |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only used by `npm run seed` |

Never commit `.env*` files. `.gitignore` already excludes them.

## Required application URLs

- Google OAuth **Authorized redirect URI:** `<BETTER_AUTH_URL>/api/auth/callback/google`
- Google OAuth **Authorized JavaScript origin:** `<BETTER_AUTH_URL>`
- Server `CLIENT_URL` and `BETTER_AUTH_URL` must equal this app's origin (CORS and JWT verification)

## Deployment (Vercel)

Import the repo, set every variable above in the Vercel dashboard, deploy. Add the deployed origin to Google OAuth and to the server's `CLIENT_URL`/`BETTER_AUTH_URL`.

## How authentication reaches the API

Better Auth keeps the session in an HTTP-only cookie. For API calls the client asks Better Auth for a short-lived **JWT** (`authClient.token()`) and sends it as `Authorization: Bearer <token>`. The Express server verifies it against this app's JWKS endpoint (`/api/auth/jwks`) and then reloads the user's role and blocked state from MongoDB.

## Photo credits

Photos are from Unsplash (free to use under the [Unsplash License](https://unsplash.com/license)): Josh Batres (couple), Adrien Olichon (venue), Jamie Coupaud (flowers), Benjamin Brunner (catering table), Victoria Priessnitz (makeup), Vivek Baghel (bridal fashion). Real vendors upload their own images through ImgBB.
