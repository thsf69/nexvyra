# NEXVYRA
Connected Work, Clearly Managed.

## Product Overview
NEXVYRA is a full-stack project & task management platform featuring a responsive Next.js web application and an Android mobile application built with React Native Expo, powered by a unified Express/PostgreSQL backend.

## Tech Stack
- **Web:** Next.js, React, Tailwind CSS, TypeScript
- **Mobile:** React Native, Expo, TypeScript
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** PostgreSQL

## Repository Structure
```
nexvyra/
├── apps/
│   ├── web/        # Next.js frontend
│   └── mobile/     # Expo Android frontend
├── backend/        # Express REST API & Prisma
└── docs/           # Documentation
```

## Deployment Prerequisites
Before deploying, ensure you have:
1. A managed PostgreSQL database (e.g. Neon, Supabase, RDS).
2. A Node.js hosting provider for the Backend (e.g. Render, Railway, Heroku).
3. A Web hosting provider (e.g. Vercel, Netlify).
4. EAS CLI configured for Android Builds (`npm i -g eas-cli`).

## Backend Setup (Production)
1. Set the following environment variables on your host:
   - `PORT=3000` (or host-assigned)
   - `DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"`
   - `JWT_SECRET="your_strong_secret_key"`
   - `CORS_ORIGIN="https://your-deployed-web-app.com"`
2. Run database migrations: `npx prisma migrate deploy`
3. Build the backend: `npm run build`
4. Start the server: `npm start`

## Web Setup (Production)
1. Set the environment variable in your Vercel/Netlify dashboard:
   - `NEXT_PUBLIC_API_URL="https://your-deployed-backend.com/api"`
2. Run the build: `npm run build`
3. Deploy the compiled static/server files.

## Mobile Setup (Android Build)
1. Set the environment variable securely before building:
   - `EXPO_PUBLIC_API_URL="https://your-deployed-backend.com/api"`
2. Make sure you are authenticated with EAS: `eas login`
3. Build the production Android bundle:
   `eas build --platform android --profile production`
4. For testing/preview APK:
   `eas build --platform android --profile preview`

## Local Development
1. **Backend**: `cd backend && npm run dev`
2. **Web**: `cd apps/web && npm run dev`
3. **Mobile**: `cd apps/mobile && npx expo start --android` (API defaults to `http://10.0.2.2:3000/api`)
