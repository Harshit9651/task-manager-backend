# SaaS CRM — Backend

Production-ready backend for a personal SaaS CRM.

**Stack:** Node.js · Express 5 · TypeScript · MongoDB (Mongoose) · Firebase Admin · JWT

## Prerequisites
- Node.js >= 20
- MongoDB (local or Atlas)
- A Firebase project + service account (for Google login)

## Getting started
```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev             # hot-reload dev server
```

Health check: `GET http://localhost:5000/api/health`

## Scripts
| Script | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check without emitting |
| `npm run clean` | Remove the `dist/` folder |