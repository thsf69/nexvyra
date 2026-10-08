# NEXVYRA
**Connected Work, Clearly Managed.**

NEXVYRA is a full-stack project and task management platform with a Next.js web application and an Expo/React Native Android application. Both clients communicate with a shared Express REST API backed by PostgreSQL.

## Features

- Account registration and login with JWT-based authentication
- Project creation, viewing, editing, deletion, status management, and search/filtering
- Task creation, viewing, editing, deletion, and filtering by status, priority, and project
- Task due dates and project start/end dates
- Dashboard summaries for projects and tasks
- Light and dark appearance modes
- Persistent project and task data across sessions

## Technology

| Layer | Stack |
| --- | --- |
| Web | Next.js 14, React, TypeScript, Tailwind CSS |
| Android | Expo, React Native, TypeScript |
| API | Node.js, Express, TypeScript, Zod |
| Data | PostgreSQL, Prisma ORM |
| Authentication | JWT, bcrypt |

## Repository Layout

```text
nexvyra/
├── apps/
│   ├── web/       # Next.js client
│   └── mobile/    # Expo / React Native Android client
├── backend/       # Express API, Prisma, and tests
├── docs/          # Additional documentation
├── package.json   # npm workspaces
└── README.md
```

## Getting Started

### Requirements

- Node.js and npm
- PostgreSQL database (local or managed)
- For Android local builds: Android SDK, Java 17, and an Android device or emulator

From the repository root, install dependencies:

```bash
npm install
```

### Backend

Configure backend environment variables in your local environment (never commit real secrets):

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

Use the origin and port that match your own web development setup. Then:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run dev
```

For a production deployment, configure environment variables with the hosting provider, run `npx prisma migrate deploy`, then `npm run build` and `npm start`.

### Web Application

Configure `NEXT_PUBLIC_API_URL` to point to the backend's API prefix:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Start the web app:

```bash
cd apps/web
npm run dev
```

For deployment, set `NEXT_PUBLIC_API_URL` in the hosting environment and run the Next.js production build.

### Android Application

Configure `EXPO_PUBLIC_API_URL` for the API reachable by your phone:

```dotenv
EXPO_PUBLIC_API_URL=https://nexvyra.onrender.com/api
```

This is the backend URL used for the tested Android build. The URL is public configuration, **not** a secret. Do not put credentials or API secrets in Expo public variables.

For Expo development:

```bash
cd apps/mobile
npx expo start
```

#### Local Android release APK (macOS)

The tested Android APK was built locally with Gradle. With Java 17 and the Android SDK installed:

```bash
cd apps/mobile
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
cd android
./gradlew assembleRelease
```

APK output:

```text
apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

**Note:** This Gradle command requires an existing generated `apps/mobile/android` native project. If that directory is absent, native project generation/configuration is required first (for example, via Expo prebuild). Ensure the API URL is configured before creating the release build. Signing and distribution requirements depend on whether the APK is for internal testing or store release.

#### Optional EAS builds

```bash
cd apps/mobile
eas build --platform android --profile preview
```

The `preview` profile produces an APK; the `production` profile is configured for an Android App Bundle (AAB). EAS requires account configuration and available build quota.

## API Overview

The backend provides routes under `/api` for authentication, projects, tasks, and dashboard summaries. Examples:

- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `/api/projects` and `/api/projects/:id`
- `/api/tasks` and `/api/tasks/:id`
- `/api/dashboard`
- `/api/health`

Authenticated resources are scoped to the signed-in user.

## Testing

### Android manual functional testing

The following scenarios were **reported as passed during testing on an Android device**:

1. Create project
2. Edit project
3. Delete project
4. Create task
5. Edit task
6. Delete task
7. Dashboard project statistics refresh
8. Project search and status filters
9. Task search, status, and priority filters
10. Light/dark mode switching and preference persistence
11. Logout, login, and saved-data persistence
12. Remove temporary test data and confirm dashboard totals

These are manual results, not a substitute for automated regression, security, accessibility, or cross-device testing.

### Backend automated tests

Run:

```bash
cd backend
npm test
```

The project has previously reported 91 passing backend tests; rerun the command on the current branch to verify the latest state.

## Deployment Notes

- Backend API used in Android testing: https://nexvyra.onrender.com/api
- Android application ID: `com.nexvyra.mobile`
- Keep `DATABASE_URL` and `JWT_SECRET` only in private environment configuration.
- Confirm deployment, production signing, and release artifacts before distributing the app.

## Submission Checklist

- [x] Android project/task functional tests completed
- [x] Android login, theme, dashboard, and filter checks completed
- [x] Temporary test data removed
- [ ] Verify current backend automated tests
- [ ] Verify production web build and deployed URL
- [ ] Confirm final APK installation on the intended submission device
- [ ] Add screenshots or a short demo recording, if required by the assessment
- [ ] Confirm assessment-specific submission instructions and deliverables
