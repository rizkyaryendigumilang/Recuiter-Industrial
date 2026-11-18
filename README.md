# Recruiter Industrial

> **Industrial Recruitment, Applicant Tracking System (ATS), & Kraepelin Psychometric Engine**  
> High-performance progressive mobile and web platform designed for manufacturing plants, industrial estates, and technical workforce hiring.

---

## 🏗 Architecture Overview

```
Recruiter-Industrial/
├── frontend/             # Next.js 16 (Turbopack) + React 19 + Tailwind CSS 4 + @base-ui/react
│   ├── src/app/          # App Router (27 static & dynamic SSR routes)
│   ├── src/components/   # Assessment engines, modals, and tactile industrial UI
│   └── src/lib/          # PocketBase client, in-memory TTL cache, parser, rate-limiter
├── backend/              # PocketBase SQLite Engine (WAL Concurrency)
│   ├── pb_migrations/    # Automated database schema migrations
│   ├── pb_hooks/         # Privilege escalation, IDOR, and audit trail hooks
│   └── backup-db.mjs     # Automated AES-256-GCM encrypted backup utility
├── test/                 # Native Node.js test runner suite (100+ tests, 20 suites)
├── plans/                # Self-contained implementation plans (shadcn/improve)
└── capacitor.config.ts   # Mobile packaging wrapper (Android Gradle & iOS Archive)
```

---

## ⚡ Quickstart

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 2. Installation
```bash
# Install root Capacitor dependencies
npm install

# Install frontend Next.js dependencies
npm --prefix frontend install
```

### 3. Environment Configuration
Copy the template to `.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

### 4. Running PocketBase Backend
```bash
cd backend
./pocketbase serve --http=127.0.0.1:8090
```

### 5. Running Frontend Development Server
```bash
cd frontend
npm run dev
# The application will be accessible at http://localhost:3000
```

---

## 🧪 Testing & Verification

The repository enforces automated verification with zero dependencies on third-party test runners:

```bash
# Run full automated test suite (104 tests across 20 suites)
npm test

# Run frontend TypeScript type checking
npx tsc -p frontend/tsconfig.json --noEmit

# Compile Next.js production build (Turbopack)
npm run --prefix frontend build
```

---

## 📱 Mobile Build & Synchronization (Capacitor)

```bash
# 1. Build mobile distribution bundle (dist/)
npm run build

# 2. Sync web assets with native mobile projects
npm run cap:sync

# 3. Open native IDEs
npm run cap:android  # Opens Android Studio
npm run cap:ios      # Opens Xcode (macOS)
```

---

## 🛡 Security & Core Capabilities

- **Kraepelin & Pauli Work Endurance Simulator**: Accurate computation of Panker (Speed), Tianker (Accuracy), Hanker (Endurance Slope), and Janker (Emotional Stability) meeting HIMPSI psychogram standards.
- **Binary Magic Bytes PDF Guard**: Strictly validates `%PDF-` file headers to block disguised malicious uploads.
- **Tamper-Proof Audit Trail**: Immutable `audit_logs` collection with append-only permissions for sensitive state transitions.
- **Hybrid Storage Adapter**: Direct Cloudflare R2 / AWS S3 uploads with automatic local disk fallback.
- **Disaster Recovery**: Automated database backups with WAL/SHM capture and AES-256-GCM encryption.

---

## 📄 License & Maintainer
Built and maintained for industrial manufacturing facilities and technical talent hiring. Licensed under the MIT License.
