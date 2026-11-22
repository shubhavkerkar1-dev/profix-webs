# ProFix — Local Plumber & Electrician Service Finder

ProFix is a secure, responsive web marketplace connecting homeowners and property managers with verified local plumbers and electricians. Customers can discover nearby professionals on an interactive OpenStreetMap view, compare ratings and upfront prices, send direct service requests to a selected professional, and track repairs through an auditable status workflow.

The architecture strictly adheres to a **zero-cost infrastructure** model designed exclusively for the **Firebase Spark plan** and **Vercel Free Tier hosting**.

---

## 1. Architectural Highlights

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Lucide React icons, React Router, TanStack Query, React Leaflet (OpenStreetMap).
- **Backend & Database:** Firebase Authentication + Cloud Firestore modular Web SDK (v9+).
- **Zero Separate Server:** No Node.js/Express backend required. Data authorization and state transitions are secured directly by Firestore Security Rules.
- **Spark Plan Constraints Met:**
  - Zero Cloud Storage (profile avatars use deterministic SVG initials with UID color hashing).
  - Zero Cloud Functions (all transactions, multi-document history logs, and atomic review updates execute client-side via `runTransaction`).
  - No Blaze upgrade or billing requirements.

---

## 2. Service Request State Machine

```
OPEN ──> ACCEPTED ──> IN_PROGRESS ──> COMPLETION_PENDING_CONFIRMATION ──> COMPLETED ──> REVIEWED
  │         │
  ├──> REJECTED (by Professional)
  │
  └──> CANCELLED (by Customer)
```

Every transition updates `serviceRequests` and atomically commits an immutable entry to `requestStatusHistory` inside a single Firestore transaction.

---

## 3. Getting Started

### Prerequisites
- Node.js 18+ (tested with Node.js v26.13)
- npm or bun

### Local Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd profix-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Firebase project credentials (from your Spark project in Firebase Console):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=profix-845c1.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=profix-845c1
   VITE_FIREBASE_STORAGE_BUCKET=profix-845c1.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=591771107246
   VITE_FIREBASE_APP_ID=1:591771107246:web:...
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. Build for Production:
   ```bash
   npm run build
   ```

---

## 4. Initial Seed Data (Categories)

To populate the initial service categories (Plumbing, Electrical, Water Heater, Burst Pipe Repair), run:
```bash
node firebase/seed/seedCategories.js
```

---

## 5. Administrator Provisioning Instructions

Under the strict Spark plan constraints (no Cloud Functions and no client self-elevation):

1. **Register the Admin Account:**
   Navigate to the registration page (`/register`) and sign up with the admin's email and password as a standard user.
2. **Assign the Admin Role via Firebase Console:**
   - Open [Firebase Console](https://console.firebase.google.com/) -> Select your project -> **Firestore Database**.
   - Navigate to the `users` collection.
   - Select the document with the administrator's `uid`.
   - Edit the `role` field value from `customer` or `professional` to `admin`.
3. **Verify Admin Access:**
   Sign in at `/login`. The top navigation will automatically provide access to the protected **Admin Dashboard** (`/admin/dashboard`), where you can:
   - Review and manually approve/reject professional applications.
   - Create, edit, and deactivate service categories.
   - Audit registered users and platform metrics.

---

## 6. Testing with Firebase Local Emulator Suite

1. Install the Firebase CLI globally if not already present:
   ```bash
   npm install -g firebase-tools
   ```

2. Start the local emulators (Firestore on port 8080, Auth on 9099, UI on 4000):
   ```bash
   firebase emulators:start
   ```

3. Open the Emulator UI at `http://localhost:4000` to inspect live Firestore collections, run Security Rules simulations, and test authorization denial cases.

---

## 7. Deployment to Vercel (Free Tier)

1. Push the code repository to GitHub/GitLab.
2. Log in to [Vercel](https://vercel.com) and import the repository.
3. In the Vercel project configuration:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the environment variables from `.env` in the Vercel Settings -> **Environment Variables** panel.
5. Click **Deploy**. Vercel will host the SPA on their global CDN for free.
