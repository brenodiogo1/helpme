# HelpMe

HelpMe is a web app project for finding and booking home-cleaning services. It has separate areas for customers, cleaners, and administrators, with pages for cleaner profiles, bookings, availability, reviews, payments, and chat.

The repository contains a React and TypeScript front end built with Vite. Supabase is included for authentication and app data; the app needs its project configuration to use those connected features.

## Run locally

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Vite prints the local address in the terminal. To create a production build or run the linter:

```bash
pnpm build
pnpm lint
```

This project is still being developed. Do not commit private keys or service credentials.
