# Quantity Measurement — Angular 16 Frontend

## Setup

```bash
npm install
ng serve
```

App runs at **http://localhost:4200**

## Backend
Make sure your .NET API is running at `http://localhost:5212`.  
To change the API URL, edit `src/environments/environment.ts`.

## Features
- ✅ Login / Register (email + password)
- ✅ Google OAuth (redirects to `/auth/callback`)
- ✅ Guest mode (local calculations, no API)
- ✅ Dashboard: Convert, Compare, Add, Subtract, Divide across Length, Volume, Weight, Temperature
- ✅ History page with filters & pagination
- ✅ Auth interceptor (Bearer token on every request)
- ✅ Auth guard (redirects unauthenticated users)

## Project Structure
```
src/app/
├── core/
│   ├── guards/         auth.guard.ts
│   ├── interceptors/   auth.interceptor.ts
│   └── services/       auth.service.ts, measurement.service.ts
├── features/
│   ├── auth/
│   │   ├── login/          (login + register screens)
│   │   └── google-callback/
│   ├── dashboard/
│   └── history/
└── shared/
    ├── components/header/
    └── models/index.ts
```
