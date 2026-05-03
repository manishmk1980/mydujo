## Database Schema (MySQL)

This document describes the core MySQL tables used by the MDPL backend API. It is based on `server/prisma/schema.prisma` and the migration scripts in `server/prisma/migrations`.

---

## Environments (important)

We use **two deployment folders** and **two databases**:

- **Development / QA (current)**
  - **Web folder**: `mdpl-qa` (current deployment target)
  - **Database**: `mdpl_db_qa`
  - **Purpose**: active development + testing

- **Production (later)**
  - **Web folder**: `mdpl`
  - **Database**: `mdpl_db`
  - **Purpose**: live site

**Rule**: All schema changes must be validated in `mdpl_db_qa` first before being applied to production.

---

## Connection

- **Engine**: MySQL 8 (utf8mb4 / utf8mb4_unicode_ci)
- **Prisma Datasource**: `provider = "mysql"`

---

## Source of truth & sync policy

For this project, treat **the actual MySQL schema in `mdpl_db_qa`** as the current baseline, and keep Prisma synced to it.

### Sync steps (DB → Prisma)
From `server/`:

- `npx prisma db pull`
- `npx prisma generate`

This ensures `server/prisma/schema.prisma` matches `mdpl_db_qa` (tables/columns/indexes/FKs).

### After baseline sync (Prisma → future DB changes)
Once `schema.prisma` matches `mdpl_db_qa`, make all future schema changes via Prisma migrations:

- Edit `server/prisma/schema.prisma`
- `npx prisma migrate dev --name <change>`
- Deploy with `npx prisma migrate deploy`

---

## Tables

### 1. `users`

Core user accounts for students, admins, and instructors.

| Column             | Type         | Constraints                         | Notes                         |
|--------------------|-------------|-------------------------------------|-------------------------------|
| `id`               | CHAR(36)    | PK, NOT NULL                        | UUID                          |
| `email`            | VARCHAR(255)| NOT NULL, UNIQUE                    | Login/email identifier        |
| `password_hash`    | VARCHAR(255)| NULL                                | Hashed password (if local)    |
| `email_verified_at`| DATETIME(0) | NULL                                | When email was verified       |
| `created_at`       | DATETIME(0) | NOT NULL, DEFAULT CURRENT_TIMESTAMP |                               |
| `updated_at`       | DATETIME(0) | NOT NULL                            | Managed by application/Prisma |

**Relations**
- 1-to-many with `refresh_tokens`
- 1-to-many with `students`
- Many-to-many with `roles` through `user_roles`

---

### 2. `roles`

Application roles are stored in `roles.name`.

**Canonical role names used by the backend** (seeded via `server/scripts/seed-roles.js`):
- `SUPER_ADMIN`
- `ADMIN`
- `INSTRUCTOR`
- `STUDENT`

| Column | Type        | Constraints                  | Notes     |
|--------|------------|------------------------------|-----------|
| `id`   | CHAR(36)   | PK, NOT NULL                 | UUID      |
| `name` | VARCHAR(64)| NOT NULL, UNIQUE             | Role name |

**Relations**
- Many-to-many with `users` through `user_roles`

---

### 3. `user_roles`

Join table linking users to roles.

| Column    | Type     | Constraints                 |
|-----------|----------|-----------------------------|
| `user_id` | CHAR(36) | PK (composite), NOT NULL    |
| `role_id` | CHAR(36) | PK (composite), NOT NULL    |

**Relations**
- FK `user_id` → `users.id` (ON DELETE CASCADE)
- FK `role_id` → `roles.id` (ON DELETE CASCADE)

---

### 4. `refresh_tokens`

Stores refresh tokens for JWT-based authentication.

| Column      | Type         | Constraints                         | Notes                      |
|-------------|--------------|-------------------------------------|----------------------------|
| `id`        | CHAR(36)     | PK, NOT NULL                        | UUID                       |
| `user_id`   | CHAR(36)     | NOT NULL                            | FK to `users.id`           |
| `token_hash`| VARCHAR(255) | NOT NULL, INDEX                     | Hashed refresh token       |
| `expires_at`| DATETIME(0)  | NOT NULL                            | Expiry timestamp           |
| `created_at`| DATETIME(0)  | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation time              |

**Relations**
- FK `user_id` → `users.id` (ON DELETE CASCADE)

---

### 5. `admin_users`

Links a `users` record to an admin profile.

| Column     | Type         | Constraints                         | Notes                |
|------------|--------------|-------------------------------------|----------------------|
| `id`       | CHAR(36)     | PK, NOT NULL                        | UUID                 |
| `user_id`  | CHAR(36)     | NOT NULL, UNIQUE                    | FK to `users.id`     |
| `email`    | VARCHAR(255) | NOT NULL                            | Admin email          |
| `created_at`| DATETIME(0) | NOT NULL, DEFAULT CURRENT_TIMESTAMP |                      |

**Relations**
- FK `user_id` → `users.id` (ON DELETE CASCADE)

---

### 6. `training_centers`

Represents individual dojos / training locations.

| Column     | Type         | Constraints                         | Notes                    |
|------------|--------------|-------------------------------------|--------------------------|
| `id`       | CHAR(36)     | PK, NOT NULL                        | UUID                     |
| `slug`     | VARCHAR(64)  | NOT NULL, UNIQUE                    | URL-safe identifier      |
| `name`     | VARCHAR(255) | NOT NULL                            | Center name              |
| `address`  | VARCHAR(512) | NULL                                | Street address           |
| `city`     | VARCHAR(128) | NULL                                |                          |
| `state`    | VARCHAR(128) | NULL                                |                          |
| `created_at`| DATETIME(0) | NOT NULL, DEFAULT CURRENT_TIMESTAMP |                          |

**Relations**
- 1-to-many with `students`

---

### 7. `students`

Student registrations and linked user accounts (where applicable).

| Column                          | Type          | Constraints                                     | Notes                                      |
|---------------------------------|---------------|-------------------------------------------------|--------------------------------------------|
| `id`                            | CHAR(36)      | PK, NOT NULL                                    | UUID                                       |
| `user_id`                       | CHAR(36)      | NULL, UNIQUE                                    | FK to `users.id` (nullable)                |
| `full_name`                     | VARCHAR(255)  | NOT NULL                                        |                                            |
| `email`                         | VARCHAR(255)  | NOT NULL, INDEX                                 | Contact email                              |
| `phone`                         | VARCHAR(32)   | NULL                                            |                                            |
| `date_of_birth`                 | DATE          | NULL                                            |                                            |
| `gender`                        | VARCHAR(32)   | NULL                                            | e.g. `"male"`, `"female"`, `"other"`       |
| `blood_group`                   | VARCHAR(16)   | NULL                                            |                                            |
| `emergency_contact`             | VARCHAR(128)  | NULL                                            |                                            |
| `parent_guardian_name`          | VARCHAR(255)  | NULL                                            |                                            |
| `aadhar_number`                 | VARCHAR(32)   | NULL                                            | India-specific ID                          |
| `qualification`                 | VARCHAR(128)  | NULL                                            | Education level                            |
| `address`                       | VARCHAR(512)  | NULL                                            | Postal address                             |
| `pincode`                       | VARCHAR(16)   | NULL                                            | PIN / ZIP                                  |
| `city`                          | VARCHAR(128)  | NULL                                            |                                            |
| `state`                         | VARCHAR(128)  | NULL                                            |                                            |
| `locality`                      | VARCHAR(128)  | NULL                                            | Area / neighborhood                        |
| `school_college_name`          | VARCHAR(255)  | NULL                                            |                                            |
| `school_college_location_city` | VARCHAR(128)  | NULL                                            |                                            |
| `school_college_location_state`| VARCHAR(128)  | NULL                                            |                                            |
| `school_college_location_pin`  | VARCHAR(16)   | NULL                                            |                                            |
| `instructor_name`              | VARCHAR(255)  | NULL                                            | Text instructor name                       |
| `preferred_discipline`         | VARCHAR(64)   | NULL                                            | e.g. `"Karate, Judo"`                      |
| `training_center_id`           | CHAR(36)      | NULL, INDEX                                     | FK to `training_centers.id` (nullable)     |
| `training_center_name`         | VARCHAR(255)  | NULL                                            | Denormalized center name                   |
| `profile_photo_url`            | VARCHAR(512)  | NULL                                            |                                            |
| `status`                       | VARCHAR(32)   | NOT NULL, DEFAULT `"pending"`, INDEX            | e.g. `"draft"`, `"pending"`, `"approved"`  |
| `marketing_opt_in`             | BOOLEAN       | NOT NULL, DEFAULT `false`                       |                                            |
| `terms_accepted_at`            | DATETIME(0)   | NULL                                            |                                            |
| `validated_at`                 | DATETIME(0)   | NULL                                            | When admin validated                       |
| `validated_by`                 | CHAR(36)      | NULL                                            | FK to `users.id` (validator)               |
| `registration_id`              | VARCHAR(32)   | NULL, UNIQUE                                    | External registration code                 |
| `enrollment_id`                | VARCHAR(64)   | NULL, UNIQUE                                    | Enrollment code                            |
| `created_at`                   | DATETIME(0)   | NOT NULL, DEFAULT CURRENT_TIMESTAMP, INDEX      |                                            |
| `updated_at`                   | DATETIME(0)   | NOT NULL                                        |                                            |

**Relations**
- FK `user_id` → `users.id` (ON DELETE SET NULL)
- FK `training_center_id` → `training_centers.id` (ON DELETE SET NULL)
- FK `validated_by` → `users.id` (ON DELETE SET NULL)

---

### 8. `instructors`

Instructor profiles for dojos.

| Column             | Type         | Constraints                         | Notes                |
|--------------------|--------------|-------------------------------------|----------------------|
| `id`               | CHAR(36)     | PK, NOT NULL                        | UUID                 |
| `user_id`          | CHAR(36)     | NULL                                | Optional FK to `users.id` |
| `full_name`        | VARCHAR(255) | NOT NULL                            |                      |
| `email`            | VARCHAR(255) | NULL                                |                      |
| `phone`            | VARCHAR(32)  | NULL                                |                      |
| `bio`              | TEXT         | NULL                                |                      |
| `city`             | VARCHAR(128) | NULL                                |                      |
| `state`            | VARCHAR(128) | NULL                                |                      |
| `profile_photo_url`| VARCHAR(512) | NULL                                |                      |
| `is_active`        | BOOLEAN      | NOT NULL, DEFAULT `true`           |                      |
| `can_login`        | BOOLEAN      | NOT NULL, DEFAULT `true`           |                      |
| `created_at`       | DATETIME(0)  | NOT NULL, DEFAULT CURRENT_TIMESTAMP |                      |
| `updated_at`       | DATETIME(0)  | NOT NULL, auto-updated              |                      |

---

### 9. `attendance`

Tracks student attendance per class session.

| Column       | Type        | Constraints                                         | Notes                      |
|--------------|-------------|-----------------------------------------------------|----------------------------|
| `id`         | CHAR(36)    | PK, NOT NULL                                        | UUID                       |
| `student_id` | CHAR(36)    | NOT NULL, INDEX                                     | FK to `students.id`        |
| `student_name`| VARCHAR(255)| NULL                                               | Denormalized student name  |
| `class_id`   | VARCHAR(64) | NOT NULL                                            | Class identifier           |
| `class_name` | VARCHAR(255)| NOT NULL                                            | Class display name         |
| `date`       | DATE        | NOT NULL, INDEX                                     | Class date                 |
| `status`     | VARCHAR(32) | NOT NULL                                            | e.g. `"present"`, `"absent"` |
| `created_at` | DATETIME(0) | NOT NULL, DEFAULT CURRENT_TIMESTAMP, INDEX          |                            |

**Indexes & Constraints**
- UNIQUE (`student_id`, `class_id`, `date`)
- FK `student_id` → `students.id` (ON DELETE CASCADE)

---

### 10. `pincode_lookup`

Reference table for resolving PIN codes to city/state.

| Column    | Type         | Constraints                         | Notes      |
|-----------|--------------|-------------------------------------|------------|
| `pincode` | VARCHAR(16)  | PK, NOT NULL                        | PIN / ZIP  |
| `city`    | VARCHAR(128) | NULL                                | City name  |
| `state`   | VARCHAR(128) | NULL                                | State name |
| `created_at`| DATETIME(0)| NULL, DEFAULT CURRENT_TIMESTAMP     |            |

---

## Relationships Overview

- `users` ↔ `roles`: many-to-many via `user_roles`
- `users` ↔ `refresh_tokens`: one-to-many
- `users` ↔ `admin_users`: one-to-one
- `users` ↔ `students`: optional one-to-one
- `training_centers` ↔ `students`: one-to-many
- `students` ↔ `attendance`: one-to-many
- `students` ↔ `pincode_lookup`: indirect via `pincode` column

Use `npx prisma migrate deploy` (or the SQL in the `migrations` folder) to keep your database schema in sync with the application.

---

## Known drift warning (as of now)

If you restored/imported a recent dump into `mdpl_db_qa`, the DB may contain additional tables/columns/FKs that are **not** represented in the current `server/prisma/schema.prisma`.

Before making further changes, run the sync steps above so this document and Prisma reflect the same schema.

