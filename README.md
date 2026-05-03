<div align="center">
  <img width="1200" height="475" alt="MDPL Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>🥋 MyDojo Platform (MDPL)</h1>
  <p>A comprehensive platform for managing martial arts schools, students, and grading progressions.</p>
</div>

---

## 🚀 Overview

**MDPL** is a modern web application designed to streamline dojo operations. It provides a seamless experience for students to track their progress, manage payments, and register for programs, while offering instructors and administrators powerful tools to manage training centers and student progression.

## 🛠️ Tech Stack

### Local Development Stack
- **Frontend Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router 7](https://reactrouter.com/) (configured with `/mdpl` basename)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/) (Icons)
- **Animations**: [Motion](https://motion.dev/)
- **State Management**: React Context API

### Backend (Node API Server)
- **Runtime**: Node.js (Express-style REST API)
- **ORM**: [Prisma](https://www.prisma.io/) (schema in `server/prisma/schema.prisma`)
- **Database**: MySQL (see `Docs/database.md` for full schema)
- **Auth**: Custom JWT-based auth with `users`, `roles`, `user_roles`, `refresh_tokens`, and `admin_users` tables

### Cloud / Remote Services
- **Primary DB Engine (Remote)**: MySQL 8 (managed DB or VPS)
- **Static Hosting**: Any static host (e.g. Nginx, Apache, Netlify, Vercel) serving the built Vite app at `/mdpl`
- **Reverse Proxy**: Nginx/Apache proxying API requests to the Node server
- **AI**: [Google Gemini](https://ai.google.dev/) via `@google/genai`

### Utilities
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Styling Helpers**: `clsx`, `tailwind-merge`

---

## 📂 Project Structure

```text
mdpl-qa/
├── public/             # Static assets (logos, icons)
├── src/
│   ├── components/     # Reusable UI components (shadcn/ui style)
│   ├── context/        # Auth, Language, and Attendance contexts
│   ├── lib/            # Shared utilities
│   ├── pages/          # Application views (student, admin, instructor)
│   │   └── admin/      # Admin-specific modules (fees, payments, etc.)
│   ├── services/       # API services (fees, notifications, auth, etc.)
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Main routing and application entry
│   └── main.tsx        # Vite initialization
├── server/             # Node.js REST API
│   ├── prisma/         # Schema, migrations
│   └── src/            # Routes, middleware, services
├── docs/               # Documentation (database.md, month-2-manual-fee-payments.md)
├── .env.example        # Environment variables template
└── vite.config.ts      # Vite configuration
```

---

## ⚡ Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS)
- MySQL 8 (local or remote; connection via `DATABASE_URL` in `server/.env`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mdpl
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your settings (e.g. `VITE_API_URL` for the backend, `GEMINI_API_KEY` if using AI features).
   In `server/.env`, set `DATABASE_URL` for your MySQL connection.

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Run backend API (server):**
   ```bash
   cd server
   npm install
   npm run dev
   ```

   Make sure your local MySQL instance is running and the connection URL is configured in `server/.env` (see `server/.env.example` if available).

### Admin Setup
To create your first super admin user, run:
```bash
cd server
node scripts/setup-super-admin.js
```

### Seed Scripts (Server)
From `server/`:

| Script | Purpose |
|--------|---------|
| `npm run seed:roles` | Seed roles: SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT |
| `npm run seed:test-student` | Create a test student (for development) |
| `npm run seed:fees-demo` | Create demo fee request + submission + notification for the test student |

**Typical flow:** Run `seed:roles` first, then `setup-super-admin.js` or `seed:test-student`, then `seed:fees-demo` to test the fee payment workflow.

---

## 📋 Manual Fee Payment (Month 2)

The **fee request and payment submission** workflow is implemented per `docs/month-2-manual-fee-payments.md`.

**Student features:**
- **My Fees** – View fee requests (issued, overdue, paid)
- **Submit Payment** – Choose method (UPI, cash, bank transfer, etc.), enter reference, upload proof
- **Payment History** – View past submissions and their status
- **Notifications** – In-app notifications with unread badge (fee issued, payment verified, etc.)

**Admin features:**
- **Fee Requests** – Create single or bulk fee requests by training center
- **Payment Review Queue** – Review submissions (verify, reject, request info)
- OVERDUE status computed on read for issued requests past due date

**API base:** `/fees` and `/notifications` (see spec for full endpoint list).

---

## 🌐 Remote / Production Setup

### Remote Tech Stack
- **App Hosting**: Any web server capable of serving a static SPA under `/mdpl` (e.g. Nginx on a VPS, shared hosting, Netlify/Vercel with base path).
- **API Hosting**: Node.js process running the `server` app (e.g. on a VPS, PM2, Docker, or a Node hosting provider).
- **Database**: Remote MySQL 8 instance (e.g. managed MySQL, RDS, Azure Database for MySQL, or MySQL on the same VPS).

### Remote Server Setup (VPS-style)
1. **Provision a server**
   - Ubuntu 22.04+, Node.js LTS, and MySQL 8 installed.

2. **Clone the repository on the server**
   ```bash
   git clone <repository-url>
   cd mdpl
   ```

3. **Configure environment variables**
   - Create `.env` in the project root (for frontend Vite variables).
   - Create `server/.env` for the API (`DATABASE_URL`, JWT secrets, etc.).

4. **Build the frontend**
   ```bash
   npm install
   npm run build
   ```
   - The built assets will be in `dist/` and must be served at `/mdpl`.

5. **Install and prepare the backend**
   ```bash
   cd server
   npm install
   npx prisma migrate deploy
   ```

6. **Run the backend API as a service**
   - Using PM2 (example):
     ```bash
     pm2 start npm --name mdpl-server -- run start
     pm2 save
     ```

7. **Configure reverse proxy**
   - Point your domain to the server.
   - Configure Nginx/Apache:
     - Serve the built `dist` folder at `/mdpl`.
     - Proxy `/api/*` (or your chosen prefix) to the Node server (e.g. `http://localhost:3000`).

8. **Verify**
   - Open `https://your-domain/mdpl` in the browser.
   - Test login/registration and admin flows against the remote API/database.

---

## � Deployment

This application is configured to run at the `/mdpl` subdirectory. For detailed deployment instructions to shared hosting or VPS, please refer to [DEPLOYMENT.md](DEPLOYMENT.md).

---

## �🛡️ License

This project is licensed under the Apache-2.0 License.


   