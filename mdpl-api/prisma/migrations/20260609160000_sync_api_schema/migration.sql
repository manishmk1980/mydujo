-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_student_id_fkey`;

-- DropIndex
DROP INDEX `attendance_date_idx` ON `attendance`;

-- DropIndex
DROP INDEX `attendance_student_id_class_id_date_key` ON `attendance`;

-- AlterTable
ALTER TABLE `admin_users` ADD COLUMN `display_name` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `class_id`,
    DROP COLUMN `class_name`,
    DROP COLUMN `date`,
    DROP COLUMN `student_name`,
    ADD COLUMN `attendance_date` DATE NOT NULL,
    ADD COLUMN `check_in_time` DATETIME(0) NULL,
    ADD COLUMN `check_out_time` DATETIME(0) NULL,
    ADD COLUMN `class_session_id` CHAR(36) NULL,
    ADD COLUMN `notes` VARCHAR(512) NULL,
    ADD COLUMN `source` VARCHAR(32) NOT NULL DEFAULT 'student',
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL,
    ADD COLUMN `validated_at` DATETIME(0) NULL,
    ADD COLUMN `validated_by` CHAR(36) NULL,
    MODIFY `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `students` ADD COLUMN `current_belt` VARCHAR(64) NULL,
    ADD COLUMN `current_rank_label` VARCHAR(64) NULL,
    ADD COLUMN `current_stripe_level` INTEGER NULL,
    ADD COLUMN `next_grading_date` DATETIME(0) NULL,
    MODIFY `status` ENUM('draft', 'pending', 'approved', 'paused', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `training_centers` ADD COLUMN `archived_at` DATETIME(0) NULL,
    ADD COLUMN `instructor_name` VARCHAR(255) NULL,
    ADD COLUMN `pincode` VARCHAR(16) NULL,
    ADD COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `status_note` VARCHAR(512) NULL,
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- CreateTable
CREATE TABLE `instructors` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `bio` VARCHAR(512) NULL,
    `city` VARCHAR(128) NULL,
    `state` VARCHAR(128) NULL,
    `profile_photo_url` VARCHAR(512) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `can_login` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `instructors_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor_student_assignments` (
    `id` CHAR(36) NOT NULL,
    `instructor_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `assigned_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `assigned_by_user_id` CHAR(36) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `instructor_student_assignments_instructor_id_idx`(`instructor_id`),
    INDEX `instructor_student_assignments_student_id_idx`(`student_id`),
    UNIQUE INDEX `instructor_student_assignments_instructor_id_student_id_key`(`instructor_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pincode_lookups` (
    `pincode` VARCHAR(16) NOT NULL,
    `city` VARCHAR(128) NOT NULL,
    `state` VARCHAR(128) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`pincode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `class_sessions` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `class_type` VARCHAR(64) NULL,
    `training_center_id` CHAR(36) NULL,
    `instructor_id` CHAR(36) NULL,
    `instructor_name` VARCHAR(255) NULL,
    `discipline` ENUM('karate_shotokan', 'judo_kodokan', 'self_defense') NULL,
    `session_date` DATE NOT NULL,
    `start_time` DATETIME(0) NULL,
    `end_time` DATETIME(0) NULL,
    `status` ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'scheduled',
    `notes` VARCHAR(512) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `class_sessions_training_center_id_idx`(`training_center_id`),
    INDEX `class_sessions_session_date_idx`(`session_date`),
    INDEX `class_sessions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `belt_rank_history` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `belt_name` VARCHAR(64) NOT NULL,
    `rank_label` VARCHAR(64) NULL,
    `stripe_level` INTEGER NULL,
    `grading_date` DATETIME(0) NULL,
    `next_eligibility_date` DATETIME(0) NULL,
    `grading_score` VARCHAR(64) NULL,
    `remarks` VARCHAR(512) NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `belt_rank_history_student_id_idx`(`student_id`),
    INDEX `belt_rank_history_grading_date_idx`(`grading_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_grading_progress` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `syllabus_completion_percent` INTEGER NOT NULL DEFAULT 0,
    `mock_review_status` VARCHAR(64) NULL,
    `readiness_status` VARCHAR(64) NULL,
    `attendance_eligibility` BOOLEAN NOT NULL DEFAULT false,
    `instructor_notes` VARCHAR(512) NULL,
    `reviewed_by_instructor_id` CHAR(36) NULL,
    `reviewed_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `student_grading_progress_student_id_key`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_requests` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `training_center_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `amount_paise` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `due_date` DATE NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    `issued_at` DATETIME(0) NULL,
    `created_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `fee_requests_student_id_status_due_date_idx`(`student_id`, `status`, `due_date`),
    INDEX `fee_requests_training_center_id_idx`(`training_center_id`),
    INDEX `fee_requests_created_by_user_id_idx`(`created_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_submissions` (
    `id` CHAR(36) NOT NULL,
    `fee_request_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `submitted_by_user_id` CHAR(36) NULL,
    `method` VARCHAR(32) NOT NULL,
    `amount_paise` INTEGER NOT NULL,
    `paid_at` DATETIME(0) NULL,
    `reference` VARCHAR(255) NULL,
    `proof_url` VARCHAR(512) NULL,
    `notes_from_student` TEXT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    `reviewed_by_user_id` CHAR(36) NULL,
    `reviewed_at` DATETIME(0) NULL,
    `review_notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `payment_submissions_fee_request_id_status_idx`(`fee_request_id`, `status`),
    INDEX `payment_submissions_student_id_created_at_idx`(`student_id`, `created_at`),
    INDEX `payment_submissions_submitted_by_user_id_idx`(`submitted_by_user_id`),
    INDEX `payment_submissions_reviewed_by_user_id_idx`(`reviewed_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discipline_options` (
    `id` CHAR(36) NOT NULL,
    `value` VARCHAR(64) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(512) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    `status_note` VARCHAR(512) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `archived_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `discipline_options_value_key`(`value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` VARCHAR(64) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `entity_type` VARCHAR(64) NULL,
    `entity_id` CHAR(36) NULL,
    `read_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `notifications_user_id_read_at_idx`(`user_id`, `read_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_enquiries` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(32) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `attendance_class_session_id_idx` ON `attendance`(`class_session_id`);

-- CreateIndex
CREATE INDEX `attendance_attendance_date_idx` ON `attendance`(`attendance_date`);

-- CreateIndex
CREATE INDEX `attendance_status_idx` ON `attendance`(`status`);

-- AddForeignKey
ALTER TABLE `instructors` ADD CONSTRAINT `instructors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_student_assignments` ADD CONSTRAINT `instructor_student_assignments_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_student_assignments` ADD CONSTRAINT `instructor_student_assignments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_class_session_id_fkey` FOREIGN KEY (`class_session_id`) REFERENCES `class_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_sessions` ADD CONSTRAINT `class_sessions_training_center_id_fkey` FOREIGN KEY (`training_center_id`) REFERENCES `training_centers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_sessions` ADD CONSTRAINT `class_sessions_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `belt_rank_history` ADD CONSTRAINT `belt_rank_history_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_grading_progress` ADD CONSTRAINT `student_grading_progress_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_requests` ADD CONSTRAINT `fee_requests_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_requests` ADD CONSTRAINT `fee_requests_training_center_id_fkey` FOREIGN KEY (`training_center_id`) REFERENCES `training_centers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_requests` ADD CONSTRAINT `fee_requests_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_fee_request_id_fkey` FOREIGN KEY (`fee_request_id`) REFERENCES `fee_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
