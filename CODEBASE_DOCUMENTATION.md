# Cloudcal - Codebase Documentation

**Generated on:** October 23, 2025  
**Project:** Cloudcal - Free Online Appointment Scheduling Software  
**Framework:** Next.js 14 (App Router)  
**Tech Stack:** TypeScript, React, Prisma, NextAuth, Nylas, TailwindCSS

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Key Technologies](#key-technologies)
5. [Database Schema](#database-schema)
6. [Routes & Pages](#routes--pages)
7. [API Routes](#api-routes)
8. [Server Actions](#server-actions)
9. [Components](#components)
10. [Libraries & Utilities](#libraries--utilities)
11. [Authentication Flow](#authentication-flow)
12. [Calendar Integration (Nylas)](#calendar-integration-nylas)
13. [File Upload (UploadThing)](#file-upload-uploadthing)
14. [Environment Variables](#environment-variables)
15. [Development Setup](#development-setup)
16. [Key Features](#key-features)
17. [Potential Improvements](#potential-improvements)

---

## Project Overview

**Cloudcal** is a modern appointment scheduling application that allows users to:
- Create custom event types (meetings with specific durations)
- Set their availability for each day of the week
- Share booking links with clients
- Integrate with Google Calendar via Nylas
- Automatically create calendar events and send invitations
- Manage scheduled meetings

The application uses Google OAuth for authentication and Nylas for calendar integration, making it easy for users to sync their availability and automatically create video conference links.

---

## Architecture

### Framework: Next.js 14 App Router
- **Server Components**: Most pages are React Server Components for optimal performance
- **Client Components**: Forms, interactive UI elements, and theme toggling use `"use client"`
- **Server Actions**: Form submissions and data mutations use Next.js Server Actions
- **Route Handlers**: API endpoints for auth, OAuth callbacks, and file uploads

### State Management
- Form state: `react-dom` (`useFormState`) + `@conform-to/react`
- Client state: React `useState` for UI interactions
- Server state: Direct database queries in Server Components

### Styling
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Radix UI primitives with TailwindCSS styling
- **Theme**: Light/dark mode support via `next-themes`

---

## Directory Structure

```
Cloudcal/
├── app/                          # Next.js App Router
│   ├── (bookingPage)/           # Route group for public booking pages
│   │   └── [username]/
│   │       └── [eventName]/
│   │           └── page.tsx     # Public booking interface
│   ├── api/                     # API route handlers
│   │   ├── auth/
│   │   │   ├── route.ts         # Nylas OAuth redirect
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts     # NextAuth handlers
│   │   ├── oauth/
│   │   │   └── exchange/
│   │   │       └── route.ts     # Nylas OAuth callback
│   │   └── uploadthing/
│   │       ├── core.ts          # Upload config
│   │       └── route.ts         # Upload handlers
│   ├── components/              # App-specific components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── demo/                # Calendar demo components
│   │   └── landingPage/         # Landing page sections
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── availability/        # Availability settings
│   │   ├── event/               # Event type management
│   │   ├── meetings/            # Meeting list
│   │   ├── new/                 # Create event type
│   │   ├── settings/            # User settings
│   │   ├── layout.tsx           # Dashboard layout
│   │   └── page.tsx             # Event types list
│   ├── lib/                     # App utilities
│   │   ├── auth.ts              # NextAuth config
│   │   ├── db.ts                # Prisma client
│   │   ├── hooks.ts             # Server-side hooks
│   │   ├── nylas.ts             # Nylas client config
│   │   ├── times.ts             # Time slots data
│   │   ├── uploadthing.ts       # UploadThing helpers
│   │   └── zodSchemas.ts        # Validation schemas
│   ├── meeting/                 # Meeting detail routes
│   ├── onboarding/              # User onboarding flow
│   │   ├── grant-id/            # Calendar connection step
│   │   └── page.tsx             # Username setup
│   ├── success/                 # Booking success page
│   ├── test/                    # Test page
│   ├── actions.ts               # Server Actions
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                  # Shared UI components
│   └── ui/                      # shadcn/ui components
├── lib/                         # Root-level utilities
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Utility functions (cn)
├── prisma/                      # Database
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Migration files
├── public/                      # Static assets
├── components.json              # shadcn/ui config
├── next.config.mjs              # Next.js config
├── package.json                 # Dependencies
├── postcss.config.mjs           # PostCSS config
├── tailwind.config.ts           # Tailwind config
└── tsconfig.json                # TypeScript config
```

---

## Key Technologies

### Core
- **Next.js 14.2.10** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type safety

### Database & ORM
- **Prisma 5.22.0** - Database ORM
- **PostgreSQL** - Database (via connection string)

### Authentication
- **NextAuth 5.0.0-beta.21** - Authentication library
- **@auth/prisma-adapter** - Prisma adapter for NextAuth

### Calendar Integration
- **Nylas 7.5.2** - Calendar API client
- **@nylas/react 1.1.3** - React components for Nylas

### UI & Styling
- **TailwindCSS 3.4.1** - Utility-first CSS
- **Radix UI** - Headless UI components
- **shadcn/ui** - Pre-styled Radix components
- **Lucide React** - Icon library
- **next-themes** - Theme management

### Forms & Validation
- **Zod 3.23.8** - Schema validation
- **@conform-to** - Progressive form validation

### File Uploads
- **UploadThing 7.0.1** - File upload service

### Date Handling
- **date-fns 3.6.0** - Date utility library
- **@internationalized/date** - i18n date handling

### Other
- **sonner** - Toast notifications
- **class-variance-authority** - Component variant utilities
- **tailwind-merge** - Merge Tailwind classes

---

## Database Schema

### Models

#### User
Primary user model for authentication and application data.

```prisma
model User {
  id            String         @id @default(uuid())
  name          String?
  email         String         @unique
  emailVerified DateTime?
  image         String?        @default("https://avatars.githubusercontent.com/u/10367109?v=4")
  accounts      Account[]
  sessions      Session[]
  grantId       String?        # Nylas grant ID
  grantEmail    String?        # Nylas grant email
  username      String?        @unique
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  Availability  Availability[]
  EventType     EventType[]
}
```

**Key Fields:**
- `grantId`, `grantEmail`: Nylas calendar connection details
- `username`: Public username for booking URLs

#### Account
OAuth provider accounts linked to users (NextAuth).

```prisma
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([provider, providerAccountId])
}
```

#### Session
User sessions (NextAuth).

```prisma
model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### EventType
User-created event types (e.g., "30 min meeting").

```prisma
model EventType {
  id                String  @id @default(uuid())
  title             String
  duration          Int     # in minutes
  url               String  # slug for booking URL
  description       String
  active            Boolean @default(true)
  videoCallSoftware String  @default("Google Meet")
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  createdAt         DateTime @default(now())
}
```

**Key Fields:**
- `url`: Unique slug for booking links (e.g., `username.com/30-min-call`)
- `active`: Toggle visibility of event type
- `videoCallSoftware`: Zoom, Google Meet, or Microsoft Teams

#### Availability
User's weekly availability schedule.

```prisma
model Availability {
  id       String  @id @default(uuid())
  day      Day     # Enum: Monday-Sunday
  fromTime String  # e.g., '08:00'
  tillTime String  # e.g., '18:00'
  isActive Boolean @default(true)
  User     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Day {
  Monday
  Tuesday
  Wednesday
  Thursday
  Friday
  Saturday
  Sunday
}
```

**Note:** When a user completes onboarding, 7 availability records are created (one per day) with default 08:00-18:00 schedule.

---

## Routes & Pages

### Public Routes

#### `/` (Landing Page)
- **File:** `app/page.tsx`
- **Description:** Marketing landing page with hero, features, testimonials, and CTA
- **Components:** Navbar, Hero, Logos, Features, Testimonial, CTA
- **Auth:** Redirects to `/dashboard` if user is logged in

#### `/[username]/[eventName]` (Booking Page)
- **File:** `app/(bookingPage)/[username]/[eventName]/page.tsx`
- **Description:** Public booking interface for scheduling meetings
- **Features:**
  - Calendar selection
  - Available time slots based on user's availability and Nylas free/busy
  - Booking form (name, email)
  - Creates calendar event via Nylas
- **Query Params:** `?date=YYYY-MM-DD&time=HH:mm`

#### `/success` (Booking Confirmation)
- **File:** `app/success/page.tsx`
- **Description:** Success confirmation after booking a meeting
- **Features:** Displays success message and close button

### Protected Routes (Dashboard)

All dashboard routes require authentication via `requireUser()` hook.

#### `/dashboard` (Event Types List)
- **File:** `app/dashboard/page.tsx`
- **Description:** Main dashboard showing user's event types
- **Features:**
  - List of event types with preview, edit, delete actions
  - Toggle active/inactive status
  - Create new event type button
  - Empty state if no event types

#### `/dashboard/new` (Create Event Type)
- **File:** `app/dashboard/new/page.tsx`
- **Description:** Form to create a new event type
- **Fields:** Title, URL slug, description, duration, video call provider
- **Action:** `CreateEventTypeAction`

#### `/dashboard/event/[eventTypeId]` (Edit Event Type)
- **File:** `app/dashboard/event/[eventTypeId]/page.tsx`
- **Description:** Form to edit an existing event type
- **Component:** `EditEventTypeForm`
- **Action:** `EditEventTypeAction`

#### `/dashboard/event/[eventTypeId]/delete` (Delete Confirmation)
- **File:** `app/dashboard/event/[eventTypeId]/delete/page.tsx`
- **Description:** Confirmation dialog for deleting an event type
- **Action:** `DeleteEventTypeAction`

#### `/dashboard/availability` (Availability Settings)
- **File:** `app/dashboard/availability/page.tsx`
- **Description:** Weekly availability editor
- **Features:**
  - Toggle each day on/off
  - Set from/till times for each day
  - Uses 30-minute time slots
- **Action:** `updateAvailabilityAction`

#### `/dashboard/meetings` (Meetings List)
- **File:** `app/dashboard/meetings/page.tsx`
- **Description:** List of upcoming and past meetings from Nylas calendar
- **Features:**
  - Displays meeting details (date, time, participants)
  - Join meeting link (Google Meet)
  - Cancel meeting button
- **Data Source:** Nylas Events API

#### `/dashboard/settings` (User Settings)
- **File:** `app/dashboard/settings/page.tsx`
- **Description:** User profile settings
- **Fields:** Full name, email (disabled), profile image
- **Features:** Image upload via UploadThing
- **Action:** `SettingsAction`

### Onboarding Routes

#### `/onboarding` (Username Setup)
- **File:** `app/onboarding/page.tsx`
- **Description:** First step of onboarding - set username and full name
- **Fields:** Full name, username
- **Validation:** Username uniqueness check
- **Action:** `onboardingAction`
- **Next:** Redirects to `/onboarding/grant-id`

#### `/onboarding/grant-id` (Calendar Connection)
- **File:** `app/onboarding/grant-id/page.tsx`
- **Description:** Prompt to connect calendar to Nylas
- **Button:** "Connect Calendar to Account" → `/api/auth`

---

## API Routes

### NextAuth Routes

#### `GET/POST /api/auth/[...nextauth]`
- **File:** `app/api/auth/[...nextauth]/route.ts`
- **Description:** NextAuth.js authentication handlers
- **Exports:** `GET`, `POST` from `auth` handlers

### Nylas OAuth Routes

#### `GET /api/auth`
- **File:** `app/api/auth/route.ts`
- **Description:** Initiates Nylas OAuth flow
- **Flow:** Redirects to Nylas authorization URL

#### `GET /api/oauth/exchange`
- **File:** `app/api/oauth/exchange/route.ts`
- **Description:** Nylas OAuth callback handler
- **Flow:**
  1. Receives authorization code from Nylas
  2. Exchanges code for grant ID and email
  3. Updates user record with `grantId` and `grantEmail`
  4. Redirects to `/dashboard`

### File Upload Routes

#### `GET/POST /api/uploadthing`
- **File:** `app/api/uploadthing/route.ts`
- **Description:** UploadThing file upload handlers
- **Config:** `app/api/uploadthing/core.ts`
- **Endpoint:** `imageUploader` - max 4MB images

---

## Server Actions

All server actions are defined in `app/actions.ts`.

### Onboarding

#### `onboardingAction`
- **Purpose:** Create username and set up initial availability
- **Validation:** Username uniqueness, format validation
- **Side Effects:**
  - Updates user with `username` and `name`
  - Creates 7 `Availability` records (Mon-Sun, 08:00-18:00)
- **Redirect:** `/onboarding/grant-id`

### Settings

#### `SettingsAction`
- **Purpose:** Update user profile (name, image)
- **Fields:** `fullName`, `profileImage`
- **Redirect:** `/dashboard`

### Event Type Management

#### `CreateEventTypeAction`
- **Purpose:** Create a new event type
- **Validation:** URL uniqueness check
- **Fields:** `title`, `url`, `description`, `duration`, `videoCallSoftware`
- **Redirect:** `/dashboard`

#### `EditEventTypeAction`
- **Purpose:** Update an existing event type
- **Validation:** URL uniqueness check (allows same URL for same event)
- **Redirect:** `/dashboard`

#### `DeleteEventTypeAction`
- **Purpose:** Delete an event type
- **Redirect:** `/dashboard`

#### `updateEventTypeStatusAction`
- **Purpose:** Toggle event type active/inactive status
- **Features:** Optimistic UI updates via `revalidatePath`
- **Returns:** Status message for toast notifications

### Availability

#### `updateAvailabilityAction`
- **Purpose:** Update weekly availability schedule
- **Features:** Batch update using Prisma transaction
- **Form Structure:** Multiple entries with `id-{id}`, `isActive-{id}`, `fromTime-{id}`, `tillTime-{id}`
- **Returns:** Status message

### Meetings

#### `createMeetingAction`
- **Purpose:** Create a calendar event via Nylas
- **Flow:**
  1. Get user's `grantId` and `grantEmail`
  2. Get event type details
  3. Calculate start/end times
  4. Create Nylas event with Google Meet conferencing
  5. Send notifications to participants
- **Redirect:** `/success`

#### `cancelMeetingAction`
- **Purpose:** Cancel/delete a calendar event
- **Features:** Uses Nylas Events API to destroy event
- **Revalidation:** `/dashboard/meetings`

---

## Components

### Dashboard Components (`app/components/dashboard/`)

#### `DasboardLinks.tsx`
Navigation links for dashboard sidebar.
- **Links:** Event Types, Meetings, Availability, Settings
- **Features:** Active state highlighting

#### `EventTypeSwitcher.tsx`
Toggle switch for event type active status.
- **Props:** `initialChecked`, `eventTypeId`
- **Action:** `updateEventTypeStatusAction`
- **Features:** Optimistic updates, toast notifications

#### `EditEventTypeForm.tsx`
Form component for editing event types.
- **Props:** Event type data (`title`, `url`, `description`, `duration`, `callProvider`, `id`)
- **Features:** Platform toggle (Zoom, Google Meet, Teams), conform validation

#### `EmptyState.tsx`
Generic empty state component.
- **Props:** `title`, `description`, `buttonText`, `href`
- **Use Cases:** No event types, no meetings

#### `settingsForm.tsx`
User settings form with image upload.
- **Props:** `fullName`, `email`, `profileImage`
- **Features:** UploadThing dropzone, image preview with delete

#### `ThemeProvider.tsx`
Next-themes provider wrapper.

#### `ThemeToggle.tsx`
Light/dark mode toggle dropdown.

#### `CopyLinkMenuItem.tsx`
Dropdown menu item to copy booking link.

### Landing Page Components (`app/components/landingPage/`)

#### `Navbar.tsx`
Landing page navigation.
- **Features:** Logo, theme toggle, auth modal

#### `Hero.tsx`
Hero section with headline and hero image.

#### `Logos.tsx`
Trusted companies logo showcase.

#### `Features.tsx`
Feature grid with icons and descriptions.

#### `Testimonial.tsx`
Customer testimonial section.

#### `Cta.tsx`
Call-to-action section.

#### `AuthModal.tsx`
Dialog for Google OAuth sign-in.

### Other Components (`app/components/`)

#### `TimeSlots.tsx`
Server component that renders available time slots for a booking page.
- **Props:** `selectedDate`, `userName`, `meetingDuration`
- **Logic:**
  1. Get user's availability from database
  2. Fetch free/busy data from Nylas
  3. Calculate available slots
  4. Filter out past times and busy slots
- **Render:** List of clickable time slot buttons

#### `SubmitButton.tsx`
Form submit button with loading state.
- **Variants:** `SubmitButton`, `GoogleAuthButton`, `GitHubAuthButton`
- **Features:** Uses `useFormStatus` for pending state

### Demo Components (`app/components/demo/`)

Calendar components using React Aria:
- `Calendar.tsx`
- `CalendarButton.tsx`
- `CalendarCell.tsx`
- `CalendarGrid.tsx`
- `CalendarHeader.tsx`
- `RenderCalendar.tsx`

### UI Components (`components/ui/`)

shadcn/ui components (Radix primitives):
- `badge.tsx`
- `button.tsx`
- `ButtonGroup.tsx`
- `calendar.tsx`
- `card.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `input.tsx`
- `label.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sonner.tsx` (toast)
- `switch.tsx`
- `textarea.tsx`
- `tooltip.tsx`

---

## Libraries & Utilities

### `app/lib/auth.ts`
NextAuth configuration.
- **Providers:** Google OAuth
- **Adapter:** PrismaAdapter
- **Exports:** `handlers`, `signIn`, `signOut`, `auth`

### `app/lib/db.ts`
Prisma client singleton.
- **Pattern:** Global singleton for development to prevent connection exhaustion

### `lib/prisma.ts`
Alternative Prisma client export (used in some files).

### `app/lib/hooks.ts`

#### `requireUser()`
Server-side hook to require authentication.
- **Returns:** Session object
- **Redirects:** `/` if not authenticated

### `app/lib/nylas.ts`
Nylas client configuration.
- **Config:** `nylasConfig` object with client ID, callback URI, API key
- **Export:** `nylas` client instance

### `app/lib/times.ts`
Array of time slots (00:00 - 23:30 in 30-minute intervals).
- **Format:** `{ id: number, time: string }`
- **Usage:** Availability time selectors

### `app/lib/uploadthing.ts`
UploadThing React components.
- **Exports:** `UploadButton`, `UploadDropzone`

### `app/lib/zodSchemas.ts`
Zod validation schemas.

#### Schemas:
- `onboardingSchema()` - Username and full name (with async uniqueness check)
- `onboardingSchemaLocale` - Client-side version without async checks
- `aboutSettingsSchema` - Full name and profile image
- `eventTypeSchema` - Event type fields
- `EventTypeServerSchema()` - Event type with async URL uniqueness check

### `lib/utils.ts`
Utility functions.

#### `cn(...inputs)`
Combines class names using `clsx` and `tailwind-merge`.

---

## Authentication Flow

### Initial Sign-In (Google OAuth)
1. User clicks "Try for Free" or "Sign in with Google"
2. Form submits to NextAuth with `signIn("google")`
3. NextAuth redirects to Google OAuth consent screen
4. Google redirects back to NextAuth callback
5. NextAuth creates/updates User, Account, and Session records
6. User redirected to landing page

### Onboarding Flow (First-Time Users)
1. After sign-in, dashboard layout checks if user has `username`
2. If no username → redirect to `/onboarding`
3. User enters username and full name
4. `onboardingAction` creates username and 7 availability records
5. Redirect to `/onboarding/grant-id`
6. User clicks "Connect Calendar"
7. Redirect to `/api/auth` (Nylas OAuth)
8. Nylas redirects to consent screen
9. Callback to `/api/oauth/exchange`
10. Exchange code for `grantId` and `grantEmail`
11. Update user record
12. Redirect to `/dashboard`

### Session Management
- NextAuth handles session cookies
- `auth()` function used in Server Components to get session
- `requireUser()` wrapper redirects if not authenticated

---

## Calendar Integration (Nylas)

### Setup
- Nylas API key and client ID stored in environment variables
- OAuth callback URL: `{NEXT_PUBLIC_URL}/api/oauth/exchange`

### Grant Flow
1. User clicks "Connect Calendar" in onboarding
2. Redirect to Nylas OAuth URL via `/api/auth`
3. User authorizes calendar access
4. Nylas redirects back with authorization code
5. `/api/oauth/exchange` exchanges code for grant ID
6. `grantId` and `grantEmail` stored in user record

### Free/Busy Queries
**Location:** `app/components/TimeSlots.tsx`

```typescript
const nylasCalendarData = await nylas.calendars.getFreeBusy({
  identifier: grantId,
  requestBody: {
    startTime: Math.floor(startOfDay.getTime() / 1000),
    endTime: Math.floor(endOfDay.getTime() / 1000),
    emails: [grantEmail],
  },
});
```

### Creating Events
**Location:** `app/actions.ts` → `createMeetingAction`

```typescript
await nylas.events.create({
  identifier: grantId,
  requestBody: {
    title: eventTitle,
    description: eventDescription,
    when: {
      startTime: unixTimestamp,
      endTime: unixTimestamp,
    },
    conferencing: {
      autocreate: {},
      provider: "Google Meet",
    },
    participants: [{ name, email, status: "yes" }],
  },
  queryParams: {
    calendarId: grantEmail,
    notifyParticipants: true,
  },
});
```

### Listing Events
**Location:** `app/dashboard/meetings/page.tsx`

```typescript
const data = await nylas.events.list({
  identifier: grantId,
  queryParams: {
    calendarId: grantEmail,
  },
});
```

### Deleting Events
**Location:** `app/actions.ts` → `cancelMeetingAction`

```typescript
await nylas.events.destroy({
  eventId: eventId,
  identifier: grantId,
  queryParams: {
    calendarId: grantEmail,
  },
});
```

---

## File Upload (UploadThing)

### Configuration
**File:** `app/api/uploadthing/core.ts`

```typescript
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await requireUser();
      return { userId: session.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return data to client
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
```

### Usage
**File:** `app/components/dashboard/settingsForm.tsx`

```typescript
<UploadDropzone
  endpoint="imageUploader"
  onClientUploadComplete={(res) => {
    setCurrentProfileImage(res[0].url);
    toast.success("Profile image uploaded");
  }}
  onUploadError={(error) => {
    toast.error(error.message);
  }}
/>
```

---

## Environment Variables

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Nylas
NYLAS_CLIENT_ID=your-nylas-client-id
NYLAS_API_SECRET_KEY=your-nylas-api-key
NYLAS_API_URL=https://api.us.nylas.com  # or appropriate region

# Public URL (for callbacks)
NEXT_PUBLIC_URL=http://localhost:3000

# UploadThing
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Setup Instructions
1. Copy `.env.example` to `.env.local` (if exists)
2. Fill in all environment variables
3. Run `npm install`
4. Run `npx prisma generate`
5. Run `npx prisma db push` (or `npx prisma migrate dev`)

---

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Google Cloud OAuth credentials
- Nylas account and API credentials
- UploadThing account

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (or run migrations)
npx prisma db push

# Run development server
npm run dev
```

### Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## Key Features

### 1. User Onboarding
- Google OAuth sign-in
- Custom username selection with uniqueness validation
- Calendar connection via Nylas
- Automatic default availability setup (Mon-Sun, 8am-6pm)

### 2. Event Type Management
- Create unlimited event types with custom:
  - Titles and descriptions
  - Durations (15, 30, 45, 60 minutes)
  - URL slugs for booking links
  - Video call platforms (Zoom, Google Meet, Teams)
- Toggle event types on/off
- Preview and share booking links
- Edit and delete event types

### 3. Availability Management
- Set working hours for each day of the week
- Toggle days on/off
- 30-minute time slot granularity
- Changes reflect immediately in booking availability

### 4. Public Booking Interface
- Clean, responsive booking page
- Calendar view with available days
- Dynamic time slot generation based on:
  - User's availability settings
  - Nylas calendar free/busy data
  - Current time (no past slots)
- Simple booking form (name + email)
- Automatic Google Meet link creation
- Email notifications to all participants

### 5. Meeting Management
- View all upcoming and past meetings
- Join meeting links (Google Meet)
- Cancel meetings with one click
- Automatic calendar updates

### 6. User Settings
- Update profile information
- Upload profile images
- Email display (not editable)

### 7. Theme Support
- Light/dark mode toggle
- System preference detection
- Persistent theme selection

---

## Potential Improvements

### Security & Error Handling
1. **API Error Handling**
   - Add try/catch blocks to all Nylas API calls
   - Implement retry logic for transient failures
   - Better error messages for users

2. **Rate Limiting**
   - Add rate limiting to API routes
   - Protect against booking spam

3. **Input Sanitization**
   - Sanitize user inputs in forms
   - XSS protection for displayed content

### Features
1. **Time Zones**
   - Display time zones on booking page
   - Convert times based on visitor's location
   - Store time zone preferences per user

2. **Email Customization**
   - Custom email templates
   - Branding options for notifications

3. **Advanced Availability**
   - Date-specific overrides
   - Vacation/holiday blocking
   - Buffer time between meetings

4. **Analytics**
   - Track booking rates
   - Popular time slots
   - Event type performance

5. **Team Features**
   - Multiple team members
   - Round-robin scheduling
   - Collective availability

6. **Integrations**
   - Zoom native integration (beyond just links)
   - Stripe for paid bookings
   - Zapier webhooks

7. **Booking Management**
   - Reschedule functionality
   - Cancellation by guests
   - Automated reminders

### Performance
1. **Caching**
   - Cache Nylas free/busy responses
   - Redis for session storage
   - ISR for public booking pages

2. **Database Optimization**
   - Add indexes for common queries
   - Optimize availability lookups

3. **Client-Side**
   - Code splitting
   - Image optimization
   - Lazy loading for dashboard components

### Testing
1. **Unit Tests**
   - Test server actions
   - Test validation schemas
   - Test utility functions

2. **Integration Tests**
   - Test booking flow end-to-end
   - Test OAuth flows
   - Test Nylas integration

3. **E2E Tests**
   - Playwright/Cypress tests
   - Critical user journeys

### DevOps
1. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Database query monitoring

2. **Logging**
   - Structured logging
   - Request/response logging
   - Audit trail for actions

3. **CI/CD**
   - Automated testing in CI
   - Type checking
   - Linting and formatting checks

### Documentation
1. **API Documentation**
   - OpenAPI/Swagger spec
   - Internal API docs

2. **User Documentation**
   - Help center
   - Video tutorials
   - FAQ section

3. **Developer Documentation**
   - Contributing guide
   - Architecture decision records
   - Setup troubleshooting

---

## File Summary

### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`postcss.config.mjs`** - PostCSS configuration
- **`next.config.mjs`** - Next.js configuration
- **`components.json`** - shadcn/ui configuration
- **`prisma/schema.prisma`** - Database schema

### Root Layout
- **`app/layout.tsx`** - Root layout with theme provider, fonts, and metadata
- **`app/globals.css`** - Global styles and Tailwind imports
- **`app/page.tsx`** - Landing page (marketing site)

### Dashboard
- **`app/dashboard/layout.tsx`** - Dashboard layout with sidebar navigation
- **`app/dashboard/page.tsx`** - Event types list
- **`app/dashboard/new/page.tsx`** - Create event type form
- **`app/dashboard/event/[eventTypeId]/page.tsx`** - Edit event type
- **`app/dashboard/event/[eventTypeId]/delete/page.tsx`** - Delete confirmation
- **`app/dashboard/availability/page.tsx`** - Availability editor
- **`app/dashboard/meetings/page.tsx`** - Meetings list
- **`app/dashboard/settings/page.tsx`** - User settings

### Onboarding
- **`app/onboarding/page.tsx`** - Username setup
- **`app/onboarding/grant-id/page.tsx`** - Calendar connection prompt

### Booking Flow
- **`app/(bookingPage)/[username]/[eventName]/page.tsx`** - Public booking interface
- **`app/success/page.tsx`** - Booking success page

### API Routes
- **`app/api/auth/route.ts`** - Nylas OAuth redirect
- **`app/api/auth/[...nextauth]/route.ts`** - NextAuth handlers
- **`app/api/oauth/exchange/route.ts`** - Nylas OAuth callback
- **`app/api/uploadthing/core.ts`** - UploadThing configuration
- **`app/api/uploadthing/route.ts`** - UploadThing handlers

### Server Actions
- **`app/actions.ts`** - All server actions (onboarding, CRUD, meetings)

### Libraries
- **`app/lib/auth.ts`** - NextAuth configuration
- **`app/lib/db.ts`** - Prisma client
- **`app/lib/hooks.ts`** - Server-side hooks
- **`app/lib/nylas.ts`** - Nylas client
- **`app/lib/times.ts`** - Time slots data
- **`app/lib/uploadthing.ts`** - UploadThing helpers
- **`app/lib/zodSchemas.ts`** - Validation schemas
- **`lib/utils.ts`** - Utility functions
- **`lib/prisma.ts`** - Alternative Prisma client

### Components (App-Specific)
- **Dashboard:** DasboardLinks, EventTypeSwitcher, EditEventTypeForm, EmptyState, settingsForm, ThemeProvider, ThemeToggle, CopyLinkMenuItem
- **Landing Page:** Navbar, Hero, Logos, Features, Testimonial, Cta, AuthModal
- **Demo:** Calendar components (React Aria)
- **Shared:** TimeSlots, SubmitButton

### Components (UI Primitives)
- **shadcn/ui components:** badge, button, ButtonGroup, calendar, card, dialog, dropdown-menu, input, label, select, separator, sheet, sonner, switch, textarea, tooltip

---

## Conclusion

Cloudcal is a well-structured Next.js application with a clean separation of concerns:
- **Server Components** for data fetching and rendering
- **Server Actions** for mutations
- **Client Components** for interactivity
- **Prisma** for type-safe database access
- **Nylas** for calendar integration
- **NextAuth** for authentication
- **Zod + Conform** for validation
- **shadcn/ui** for consistent UI

The codebase follows modern React and Next.js best practices, with proper TypeScript typing, error handling in most places, and a logical file structure. The main areas for improvement are enhanced error handling, time zone support, and additional testing coverage.

---

**End of Documentation**
