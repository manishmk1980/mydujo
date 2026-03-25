You are a senior full-stack engineer working on the MDPL platform.

Your task is to implement the next product phase in the existing codebase:

PHASE: Instructor Introduction and Attendance Support

Do not redesign the app from scratch.
Do not invent a parallel architecture.
First inspect the current codebase and then implement this phase using existing patterns, middleware, route structure, UI conventions, auth flow, Prisma models, and deployment style.

==================================================
1. ENVIRONMENT AND DELIVERY RULES
==================================================

Target first:
- Web app root: mdpl-qa
- Database: mdpl_db_qa

Later promotion:
- Web app root: mdpl
- Database: mdpl_db

Rules:
- QA first only
- do not assume production-first
- keep all routes working under /mdpl-qa/
- reuse current auth and role middleware
- reuse existing attendance models and assignment models
- reuse current dashboard/component styling
- preserve current project naming style and folder conventions
- do not break existing student registration and fee workflows

==================================================
2. BUSINESS GOAL
==================================================

After student registration and fee handling, the next operational layer is introducing instructors into the system for attendance-related support.

We need a mechanism to:
- onboard instructors into the system
- define their benefits, responsibilities, and access boundaries
- assign their training location, batch, and operational scope via super admin
- allow instructors to manage attendance and student wellbeing for assigned students
- give instructors meaningful but controlled operational visibility
- update website messaging related to instructor-led discipline, transparency, and structured training
- include instructor dashboard metric placeholders with fixed dummy data for now

This phase should begin digitization of class delivery without giving instructors unrestricted admin power.

==================================================
3. CORE PRODUCT DECISIONS
==================================================

These decisions are mandatory unless current code architecture requires a safer equivalent:

1. Instructor is a controlled internal role, not a public self-registration role.
2. Super admin creates and activates instructor accounts.
3. Super admin assigns:
   - training center / training location
   - student batch
   - class sessions / schedule
4. Instructor can only access assigned scope.
5. Instructor can mark attendance only for assigned students/sessions.
6. Instructor cannot access fees, global reporting, global settings, or unrestricted student data.
7. Historical attendance edits must be controlled.
8. Dashboard metrics can use fixed placeholder dummy values for this phase.
9. Keep first release simple, safe, and operationally stable.

==================================================
4. EXISTING DOMAIN ENTITIES TO REUSE
==================================================

Use existing schema/entities where possible:
- users
- roles
- user_roles
- instructors
- students
- training_centers
- class_sessions
- attendance
- instructor_student_assignments

Expected backend roles:
- SUPER_ADMIN
- ADMIN
- INSTRUCTOR
- STUDENT

Do not create duplicate user-role systems.
Do not create duplicate assignment concepts if current entities already support them.

==================================================
5. SCOPE
==================================================

IN SCOPE
- instructor role setup
- instructor onboarding by super admin
- instructor access/control boundaries
- instructor-linked student visibility
- instructor-linked schedule/session visibility
- instructor attendance support workflow
- student attendance marking support by instructor
- instructor-linked attendance visibility
- basic operational checks for attendance records
- website information updates related to instructors
- instructor dashboard placeholders with fixed dummy data

OUT OF SCOPE
- public instructor signup
- payroll
- compensation
- fee collection by instructors
- global student administration by instructors
- advanced parent communication engine
- substitute instructor logic
- advanced instructor performance analytics
- complex multi-center scheduling engine

==================================================
6. REQUIRED SYSTEM BEHAVIOR
==================================================

SUPER ADMIN / ADMIN
Must be able to:
- create instructor account
- assign INSTRUCTOR role
- assign training center
- assign student batch
- assign class sessions / schedule
- activate/deactivate instructor login
- view instructor assignment summary
- review attendance anomalies if needed

INSTRUCTOR
Must be able to:
- log in
- view own profile
- view assigned students only
- view assigned sessions/schedule only
- view attendance history within assigned scope
- mark attendance for assigned students and sessions
- make limited attendance correction with reason where allowed
- see dashboard with placeholder metrics

INSTRUCTOR MUST NOT BE ABLE TO:
- access fees
- manage payments
- create/delete global users
- manage roles
- access unassigned students
- access academy-wide reporting
- modify global settings
- change training center assignment themselves

==================================================
7. INSTRUCTOR RESPONSIBILITIES TO REPRESENT IN PRODUCT
==================================================

Operational responsibilities:
- manage attendance for assigned batch
- ensure attendance is marked accurately and on time
- monitor attendance consistency
- identify absences and irregularity
- support student wellbeing visibility
- escalate issues when needed

Student oversight responsibilities:
- track batch participation
- identify students needing follow-up
- maintain structured class environment
- flag issues for admin review when needed

Product should reflect these responsibilities through UX, labels, and access scope.

==================================================
8. ONBOARDING FLOW TO IMPLEMENT
==================================================

Implement a controlled onboarding flow:

STEP 1
Super admin creates instructor profile with fields:
- full_name
- email
- phone
- city
- state
- bio
- profile_photo_url optional
- is_active
- can_login

Optional fields if existing schema supports them:
- specialization
- discipline
- notes

STEP 2
System creates linked auth account:
- create users row
- create instructors row
- assign INSTRUCTOR role in user_roles

STEP 3
Super admin assigns operational scope:
- training center
- assigned students
- assigned sessions / schedule

STEP 4
Instructor receives access:
- temporary password or existing internal invite/reset flow

STEP 5
On first login, show onboarding acknowledgment screen:
- role summary
- attendance rules
- privacy expectations
- responsibilities
- operational boundaries
- acknowledgment checkbox

If schema change is needed, add something like:
- onboarding_completed_at
Only if needed and safe.

==================================================
9. API REQUIREMENTS
==================================================

Inspect existing route/module conventions first.
Then implement or extend routes using current backend style.

ADMIN / SUPER_ADMIN APIs

1. POST /admin/instructors
Create instructor profile and linked auth account.

2. GET /admin/instructors
List instructors with filters:
- active/inactive
- center
- search by name/email

3. GET /admin/instructors/:id
Return instructor details plus assignment summary.

4. PATCH /admin/instructors/:id
Update instructor profile and active/login flags.

5. POST /admin/instructors/:id/assign-students
Assign one or more students to instructor.

6. POST /admin/instructors/:id/assign-sessions
Assign one or more class sessions to instructor.

7. POST /admin/instructors/:id/assign-center
Assign or update training center if current model needs explicit action.

INSTRUCTOR APIs

8. GET /instructor/me
Return instructor profile and role summary.

9. GET /instructor/my/students
Return only assigned students.
Allow filters:
- search
- status
- training center if relevant

10. GET /instructor/my/sessions
Return only assigned sessions.
Allow filters:
- today
- week
- date range

11. GET /instructor/my/attendance
Return attendance within instructor scope.
Allow filters:
- student
- session
- date range
- status

12. POST /instructor/attendance/mark
Mark attendance for assigned session/student roster.

13. PATCH /instructor/attendance/:id
Allow controlled update/correction with reason where allowed.

OPTIONAL SUPPORT API
14. GET /instructor/dashboard
Return instructor dashboard data.
For this phase, placeholder metrics may be fixed dummy values via service/config.

==================================================
10. ATTENDANCE WORKFLOW
==================================================

Implement the following:

1. Instructor opens assigned session roster.
2. Instructor sees only assigned students in that session/batch.
3. Instructor marks attendance using current allowed attendance statuses.
4. Save attendance safely.
5. Prevent duplicates for same student + session + date.
6. Allow limited correction with reason where allowed.
7. Block out-of-scope attendance marking.
8. Support attendance history visibility within assigned scope.

If current attendance enum/statuses already exist, reuse them.
Do not invent a second attendance status system unless required.

==================================================
11. VALIDATIONS AND GUARDRAILS
==================================================

Mandatory validations:

- instructor must be active to access instructor functionality
- instructor must have INSTRUCTOR role
- instructor can only view assigned students
- instructor can only view assigned sessions
- instructor can only mark attendance for assigned scope
- duplicate attendance must be prevented
- corrections outside allowed window require reason
- locked/historical attendance must not be freely editable
- inactive/paused/rejected students must be handled safely
- unauthorized access must return proper forbidden/denied response

If business-safe, allow admin/super admin override paths using current patterns.

==================================================
12. FRONTEND SCREENS TO IMPLEMENT
==================================================

Reuse existing layout, navigation, table, card, filter, modal, and form patterns.

ADMIN SCREENS

1. Instructor List
Columns:
- name
- email
- phone
- center
- assigned students count
- assigned sessions count
- status
- actions

2. Add/Edit Instructor
Fields:
- full name
- email
- phone
- city/state
- bio
- profile photo
- active
- can login

3. Instructor Assignment Screen
Sections:
- training center assignment
- student assignment
- session assignment
- current scope summary

4. Attendance Oversight
Read/review instructor-marked attendance and anomalies if current admin UI pattern allows it.

INSTRUCTOR SCREENS

5. Instructor Dashboard
Cards with dummy placeholders:
- assigned students
- today sessions
- pending attendance
- completed attendance
- absent this week
- students needing follow-up

Panels:
- today schedule
- recent attendance actions
- flagged students
- upcoming sessions

6. My Students
Table/list of assigned students only.

7. My Schedule
Today/week/upcoming assigned sessions.

8. Mark Attendance
Roster-based attendance entry screen.

9. Attendance History
History within instructor scope.

10. My Profile
Own instructor profile summary.

11. First Login Onboarding Acknowledgment
Must be shown once on first login if implemented.

==================================================
13. DASHBOARD PLACEHOLDER METRICS
==================================================

For this phase, use fixed dummy data through service/config, not random inline hardcoding deep in UI.

Suggested placeholders:
- Assigned Students: 42
- Today Sessions: 3
- Pending Attendance: 1
- Completed Attendance: 2
- Absent This Week: 6
- Students Needing Follow-Up: 4

Structure implementation so these can later be replaced by real queries without redesign.

==================================================
14. WEBSITE CONTENT / PUBLIC MESSAGE UPDATES
==================================================

Update website content blocks/pages/modules to reflect:

- instructor-led training
- structured batch supervision
- attendance transparency
- student wellbeing oversight
- professional academy operations
- discipline and consistency

Do not overbuild a CMS.
Reuse current website content architecture.
Add/update only where relevant and safe.

==================================================
15. DATABASE / PRISMA GUIDANCE
==================================================

Before changing schema:
- inspect current Prisma models
- inspect existing instructors model
- inspect assignment relations
- inspect class_sessions and attendance relations

Only add schema changes if necessary.
Prefer using existing entities first.

Potential safe schema additions only if needed:
- instructors.onboarding_completed_at
- instructors.last_login_at
- instructors.specialization or discipline
- audit-friendly support fields if current style already supports such additions

Do not add unnecessary tables.
Do not create schema churn unless required for clean implementation.

If schema changes are needed:
- validate against mdpl_db_qa first
- keep migration clean and minimal
- follow existing Prisma migration workflow already used in this project

==================================================
16. IMPLEMENTATION ORDER
==================================================

Follow this order exactly.

PHASE A — CODEBASE AUDIT
- inspect current auth flow
- inspect role middleware
- inspect existing instructor representation
- inspect attendance routes/services/pages
- inspect class session and assignment logic
- inspect dashboard architecture
- inspect website content modules

PHASE B — BACKEND ACCESS MODEL
- ensure INSTRUCTOR role works end-to-end
- implement scoped instructor APIs
- ensure admin-only onboarding and assignment operations
- ensure instructor scope enforcement in service layer

PHASE C — ONBOARDING / ADMIN FLOW
- admin instructor create/edit
- linked user creation
- instructor role assignment
- training center assignment
- student assignment
- session assignment
- login activation/deactivation
- first-login acknowledgment flow

PHASE D — ATTENDANCE FLOW
- assigned session roster
- mark attendance
- correction with reason
- attendance visibility/history
- duplicate prevention
- scope validation

PHASE E — DASHBOARD / UI
- instructor dashboard
- my students
- my schedule
- mark attendance
- attendance history
- onboarding acknowledgment
- placeholder metrics

PHASE F — WEBSITE CONTENT
- update relevant public-facing blocks/pages

PHASE G — TEST / VALIDATION
- role-based access checks
- scope validation checks
- attendance marking checks
- duplicate prevention
- instructor inactive-state checks
- route/path checks under /mdpl-qa/

==================================================
17. QA REQUIREMENTS
==================================================

Validate in QA:
- instructor creation works
- linked login works
- role assignment works
- center assignment works
- batch/student assignment works
- session assignment works
- instructor sees only assigned scope
- attendance marking works
- duplicate attendance is blocked
- out-of-scope attempts are blocked
- dummy dashboard metrics render
- website content updates render correctly
- no fee/admin leakage into instructor UI

==================================================
18. OUTPUT FORMAT REQUIRED
==================================================

When finished, return exactly this structure:

1. SUMMARY
- what was implemented

2. BACKEND FILES CHANGED
- grouped list

3. FRONTEND FILES CHANGED
- grouped list

4. DB / PRISMA CHANGES
- exact schema changes and migration names if any

5. APIs ADDED / UPDATED
- endpoint list with purpose

6. ROLE / ACCESS RULES
- enforced permissions summary

7. QA VALIDATION STEPS
- exact manual test steps

8. PRODUCTION PROMOTION STEPS
- safe rollout order for mdpl / mdpl_db

9. OPEN NEXT-PHASE RECOMMENDATIONS
- concise list only

==================================================
19. IMPORTANT IMPLEMENTATION STYLE RULES
==================================================

- do not ask for confirmation unless truly blocked
- make grounded assumptions from existing code structure
- prefer minimal safe changes over broad rewrites
- preserve current project conventions
- keep implementation production-minded
- do not use mock architecture disconnected from the real app
- if a better solution is needed, explain briefly in final output and implement the safest practical version