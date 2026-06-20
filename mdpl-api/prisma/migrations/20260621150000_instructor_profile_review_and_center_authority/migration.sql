ALTER TABLE `instructors`
    ADD COLUMN `approval_status` VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `approved_at` DATETIME(0) NULL,
    ADD COLUMN `approved_by_user_id` CHAR(36) NULL,
    ADD COLUMN `public_discipline` VARCHAR(128) NULL,
    ADD COLUMN `public_consent_confirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `public_review_status` VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `public_review_submitted_at` DATETIME(0) NULL,
    ADD COLUMN `public_changes_requested_note` VARCHAR(1000) NULL;

CREATE TABLE `instructor_training_center_assignments` (
    `id` CHAR(36) NOT NULL,
    `instructor_id` CHAR(36) NOT NULL,
    `training_center_id` CHAR(36) NOT NULL,
    `can_view_students` BOOLEAN NOT NULL DEFAULT true,
    `can_manage_attendance` BOOLEAN NOT NULL DEFAULT false,
    `can_manage_grading` BOOLEAN NOT NULL DEFAULT false,
    `can_manage_classes` BOOLEAN NOT NULL DEFAULT false,
    `assigned_by_user_id` CHAR(36) NULL,
    `assigned_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `instructor_training_center_assignments_instructor_id_training_center_id_key`(`instructor_id`, `training_center_id`),
    INDEX `instructor_training_center_assignments_instructor_id_idx`(`instructor_id`),
    INDEX `instructor_training_center_assignments_training_center_id_idx`(`training_center_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `instructor_training_center_assignments`
    ADD CONSTRAINT `instructor_training_center_assignments_instructor_id_fkey`
    FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `instructor_training_center_assignments`
    ADD CONSTRAINT `instructor_training_center_assignments_training_center_id_fkey`
    FOREIGN KEY (`training_center_id`) REFERENCES `training_centers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
