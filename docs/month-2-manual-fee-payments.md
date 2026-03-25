# Month 2 — Manual Fee Payment Workflow (Spec + Stepwise Implementation)

## Goals (Month 2)
- Enable **admin-generated fee requests** (monthly fees, admission, grading, misc.).
- Let **students/parents see dues** and submit a **manual payment submission** (UPI/cash/bank transfer) with proof.
- Provide **basic status tracking** and an **admin review/verify** flow.
- Provide **foundational record keeping** and **notifications/alerts** (in-app to start).

## Environments (where this ships first)
- **Current deployment folder (dev/QA/staging)**: `mdpl-qa`
- **Current database (dev/QA)**: `mdpl_db_qa`
- **Production (later)**: folder `mdpl`, database `mdpl_db`

**Rule**: Month 2 manual payment workflow is implemented and validated in `mdpl_db_qa` first, then promoted to production.

## Key roles & responsibilities
- **Student (STUDENT)**: view fee requests, submit payment proof, track status, receive notifications.
- **Admin (ADMIN / SUPER_ADMIN)**: generate fee requests, configure fee rules, review submissions, verify/reject, record notes, notify student.
- **Instructor (INSTRUCTOR)** (optional in Month 2): view student fee status (read-only) or assist by marking “seen/collected cash” (requires explicit permission).

## Workflow summary (happy path)
1. Admin creates a **Fee Request** for a student (or batch) with amount and due date.
2. Student sees it as **Due** and submits a **Payment Submission** (method + reference + optional proof upload).
3. System marks submission **SUBMITTED** and notifies admin.
4. Admin reviews and marks **VERIFIED** (or **REJECTED/NEEDS_INFO**).
5. Student sees final status; fee request becomes **PAID** once verified.

## Status model (single source of truth)
Keep these as enums/consts in both backend and frontend (and documented here).

### FeeRequestStatus
- **DRAFT**: admin preparing; not visible to student
- **ISSUED**: visible; not yet due
- **OVERDUE**: computed (or stored) when past due date and not paid
- **PAID**: fully covered by verified submissions
- **CANCELLED**: voided

### PaymentSubmissionStatus
- **SUBMITTED**: student submitted; awaiting review
- **NEEDS_INFO**: admin requests correction (missing UTR, blurry proof, etc.)
- **VERIFIED**: accepted
- **REJECTED**: invalid/unmatched
- **CANCELLED**: student withdrew before verification (optional)

## Data model (Prisma/MySQL)
Existing schema (`server/prisma/schema.prisma`) has `users`, `roles`, `user_roles`, `students`, etc. Month 2 adds the following tables/models.

### Baseline requirement: Prisma must match `mdpl_db_qa` before adding payments
Before adding these new payment models, first ensure Prisma is synced to the actual QA database:

- Set `DATABASE_URL` to `mdpl_db_qa`
- From `server/`: `npx prisma db pull` then `npx prisma generate`

This avoids building Month 2 features on an outdated schema.

### 1) Fee Requests
**Table**: `fee_requests`
- `id` (uuid char(36), PK)
- `student_id` (FK → `students.id`, indexed)
- `training_center_id` (FK → `training_centers.id`, nullable, indexed)
- `title` (varchar) e.g. “April Monthly Fee”
- `description` (text, nullable)
- `amount_paise` (int) store INR as paise to avoid float issues
- `currency` (varchar(3)) default `INR`
- `due_date` (date)
- `status` (varchar) values from FeeRequestStatus
- `issued_at` (datetime, nullable)
- `created_by_user_id` (FK → `users.id`, indexed)
- `created_at`, `updated_at`

**Constraints**
- Index on `(student_id, status, due_date)`
- Optional idempotency key for bulk generation (future)

### 2) Payment Submissions (manual)
**Table**: `payment_submissions`
- `id` (uuid, PK)
- `fee_request_id` (FK → `fee_requests.id`, indexed)
- `student_id` (FK → `students.id`, indexed; denormalize for filtering)
- `submitted_by_user_id` (FK → `users.id`, nullable if not logged-in submission ever allowed)
- `method` (varchar) enum-ish: `UPI`, `CASH`, `BANK_TRANSFER`, `CHEQUE`, `OTHER`
- `amount_paise` (int)
- `paid_at` (datetime, nullable) when student claims they paid
- `reference` (varchar, nullable) UTR/TxnId/ChequeNo
- `proof_upload_id` (FK → uploads table or store url; see “Uploads” below)
- `notes_from_student` (text, nullable)
- `status` (varchar) values from PaymentSubmissionStatus
- `reviewed_by_user_id` (FK → users.id, nullable)
- `reviewed_at` (datetime, nullable)
- `review_notes` (text, nullable)
- `created_at`, `updated_at`

**Constraints**
- Index on `(fee_request_id, status)`
- Index on `(student_id, created_at)`

### 3) Notifications (in-app first)
**Table**: `notifications`
- `id` (uuid, PK)
- `user_id` (FK → users.id, indexed)
- `type` (varchar) e.g. `FEE_REQUEST_ISSUED`, `PAYMENT_SUBMITTED`, `PAYMENT_VERIFIED`, `PAYMENT_NEEDS_INFO`, `PAYMENT_REJECTED`
- `title` (varchar)
- `message` (text)
- `entity_type` (varchar) `fee_request` | `payment_submission`
- `entity_id` (char(36))
- `read_at` (datetime, nullable)
- `created_at`

### Uploads (already present)
Backend already has `/upload` routes and `/uploads` static hosting (`server/src/app.js`). Month 2 uses that for payment proofs:
- Accept image/pdf uploads
- Store returned URL or upload record id on `payment_submissions.proof_upload_id` / `proof_url`

## API surface (backend)
Add new router: `server/src/routes/fees.routes.js` mounted at `/fees`.

### Admin endpoints (ADMIN/SUPER_ADMIN)
- `POST /fees/requests`
  - Create one request for one student
- `POST /fees/requests/bulk`
  - Generate requests for many students (by training center / discipline / status=approved)
- `GET /fees/requests`
  - Query by status, due date range, student_id, training_center_id
- `PATCH /fees/requests/:id`
  - Update title/amount/due date/status (with guardrails: cannot edit PAID except notes)
- `GET /fees/submissions`
  - Review queue by status/date
- `PATCH /fees/submissions/:id/review`
  - Body: `{ status: VERIFIED|REJECTED|NEEDS_INFO, review_notes }`

### Student endpoints (STUDENT)
- `GET /fees/my/requests`
  - Returns current + past fee requests for logged-in student (including paid)
- `POST /fees/my/submissions`
  - Create payment submission for a fee request (validations below)
- `GET /fees/my/submissions`
  - Payment history view
- `PATCH /fees/my/submissions/:id`
  - Only allowed when status is `NEEDS_INFO` (update reference/proof/notes)

### Validations & rules
- Student can only submit against **their own** `fee_request_id`.
- Submission amount must be \(> 0\) and \(<=\) fee request remaining due (Month 2 can keep it simple: require exact match).
- FeeRequest status must be `ISSUED` (or `OVERDUE`) to accept submissions.
- When admin marks a submission `VERIFIED`, set FeeRequest to `PAID` (Month 2: assume one request paid by one verified submission; partial payments can be Phase 3).

### Auth & authorization
- Reuse existing `requireAuth` middleware.
- Add a simple `requireRole([...])` middleware:
  - Admin endpoints: `ADMIN`, `SUPER_ADMIN`
  - Student endpoints: `STUDENT` (and ensure student mapping via `/auth/me` gives student id)
  - Instructor optional: read-only queries if enabled

## Frontend implementation (React)
### New/updated pages
- **Student**
  - `My Fees` (new): list fee requests with status chips and CTA “Submit Payment”
  - `Submit Payment` (new): choose method, enter reference, upload proof, submit
  - `Payment History` (update existing `src/pages/PaymentHistory.tsx`): render `GET /fees/my/submissions`
  - `Notifications` (new or header bell): `GET /notifications/my`
- **Admin**
  - `Fee Requests` (new): create/search/issue requests; bulk generation
  - `Payment Review Queue` (new): submissions list with filters; review drawer

### Client-side state & contracts
- Add `src/services/feesService.ts`:
  - `getMyFeeRequests()`, `submitPayment()`, `getMySubmissions()`
  - admin: `createFeeRequest()`, `bulkGenerateFeeRequests()`, `listSubmissions()`, `reviewSubmission()`
- Standardize DTOs:
  - Use snake_case from backend or map consistently to camelCase (pick one; recommend camelCase on frontend).

### UX details (Month 2 baseline)
- Fee request cards show: title, amount, due date, status, last update.
- Submission form:
  - method required
  - reference required for UPI/bank/cheque; optional for cash
  - proof optional for cash; recommended for UPI/bank/cheque
  - confirm screen “Submitted — awaiting verification”
- Payment status timeline on fee detail:
  - Issued → Submitted → Verified/Needs info/Rejected

## Keeping Prisma, DB, and JSON fixtures synchronized
Treat **Prisma schema as the source of truth** for the DB structure.

### Stepwise sync process
0. **Baseline**: sync Prisma to QA DB (`mdpl_db_qa`) first (`db pull` + `generate`).
1. **Update `server/prisma/schema.prisma`** with new models (`fee_requests`, `payment_submissions`, `notifications`).
2. Run Prisma migration (MySQL, on `mdpl_db_qa` first):
   - `npx prisma migrate dev --name manual-fee-payments`
   - `npx prisma generate`
3. Add/extend seed scripts:
   - `server/scripts/seed-roles.js` already seeds `SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT`
   - Add `server/scripts/seed-fees-demo.js` (Month 2) to create sample fee requests and submissions for a demo student.
4. **JSON fixture alignment (QA first)**
   - `roles.json` currently lists `admin/instructor/student` (lowercase). Update it to mirror DB roles (`SUPER_ADMIN`, `ADMIN`, `INSTRUCTOR`, `STUDENT`) or remove it if DB is authoritative.
   - Add fixtures:
     - `payment-methods.json` with allowed methods and display labels
     - `fee-statuses.json` and `payment-statuses.json` (optional) if the UI uses fixtures for labels
5. Frontend constants:
   - Add `src/constants/fees.ts` exporting the same enums for UI labels.
6. Add a “schema + fixtures contract check” script:
   - Validate that frontend enums match backend allowed values (lightweight: unit test or a JSON validation script).

## Stepwise implementation plan (engineering)
### Phase 2.1 — DB + core APIs (week 1)
- Add Prisma models + migration.
- Implement `/fees` router with:
  - Admin create fee request
  - Student list my fee requests
  - Student submit payment submission (no proof required yet)
  - Admin list submissions + review (verify/reject/needs_info)
- Add `notifications` table and create notifications on:
  - fee request issued
  - payment submitted
  - payment reviewed

### Phase 2.2 — Upload proof + UI (week 2)
- Integrate existing upload endpoint into “Submit Payment”.
- Store proof reference on `payment_submissions`.
- Build student pages:
  - My Fees + Submit Payment + Payment History update
- Build admin pages:
  - Fee Requests (create + list)
  - Review Queue (filters + review action)

### Phase 2.3 — Bulk generation + alerts (week 3–4)
- Add bulk fee request generation:
  - by training center, by month, for all approved students
- Add overdue alerts:
  - Compute `OVERDUE` client-side or via nightly job (Month 2 can compute on read)
- Improve notifications:
  - in-app unread badge
  - optional email/WhatsApp hooks as placeholders (log-only in Month 2)

## Test plan (minimum)
- **Backend**
  - Student cannot submit for another student’s fee request
  - Admin can verify; student sees status change
  - FeeRequest becomes PAID when verified (Month 2 assumption: one submission covers it)
- **Frontend**
  - Routing works under `/mdpl-qa/`
  - Fee list loads, submission form validates, history renders

## Marketing (parallel workstream)
### Messaging themes
- Simple & transparent fee submission
- Trust: “Your payments are recorded, trackable, and verified”
- Organized management: fewer missed payments, clear due dates

### Content deliverables (Month 2)
- Website section: “How Fee Submission Works” (3 steps + FAQ)
- 4–6 social posts:
  - “Pay via UPI and upload proof”
  - “Track verification status”
  - “Reminders before due date”
- Lead nurturing templates (WhatsApp/email):
  - Inquiry → demo booking → follow-up → onboarding checklist

