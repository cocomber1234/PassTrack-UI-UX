# PASSTRACK

PASSTRACK is a responsive passport application tracking portal. It provides a member sign-in and registration flow, an overview dashboard, application and document progress tracking, and inquiry message threads.

## Features

- Member account registration and sign-in with helpful invalid-credential errors
- Dashboard overview for applications, document tasks, and inquiries
- Local application checklist with sample progress steps and document status
- Inquiry creation, replies, and resolution
- Responsive interface built with Tailwind CSS
- Browser-only storage using `localStorage`; no database or external authentication service is configured

## Technology

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Browser `localStorage` for demo accounts, sessions, applications, and inquiries

## Run locally

Install [Node.js 22 LTS](https://nodejs.org/) or newer, then from the repository root run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) and register a test account.

Keep the development server running in the terminal while using the app. Press `Ctrl+C` to stop it.

## Available commands

```bash
npm run dev    # Start the local development server
npm run build  # Create a production build
npm start      # Serve a production build
npm run lint   # Run ESLint
```

## App routes

| Route | Description |
| --- | --- |
| `/login` | Sign in or create a member account |
| `/dashboard` | Member overview and recent activity |
| `/applications` | Application status and document progress |
| `/inquiries` | List and create support inquiries |
| `/inquiries/[id]` | View and reply to an inquiry thread |

## Demo storage and security

This is a frontend-only demo, not a production authentication or passport service. Account and portal data are kept in the current browser's `localStorage`; they are not shared with other browsers or devices, and clearing browser storage removes the data. Passwords are salted and hashed in the browser, but client-side storage is not a secure place for real credentials. **Use only test accounts and passwords; do not enter real passport, identity, or other sensitive information.**

Application progress changes are simulations. Document status controls do not upload or store files, and inquiry messages remain local to the browser rather than reaching a support team.

## Repository notes

The application source lives in `app/`, shared UI components in `components/`, and local browser data helpers in `lib/`.
