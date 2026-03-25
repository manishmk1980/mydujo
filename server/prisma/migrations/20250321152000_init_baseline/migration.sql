-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `email_verified_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `user_id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    INDEX `refresh_tokens_token_hash_idx`(`token_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `admin_users_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_centers` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(512) NULL,
    `city` VARCHAR(128) NULL,
    `state` VARCHAR(128) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `training_centers_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `date_of_birth` DATE NULL,
    `gender` VARCHAR(32) NULL,
    `blood_group` VARCHAR(16) NULL,
    `emergency_contact` VARCHAR(128) NULL,
    `parent_guardian_name` VARCHAR(255) NULL,
    `aadhar_number` VARCHAR(32) NULL,
    `qualification` VARCHAR(128) NULL,
    `address` VARCHAR(512) NULL,
    `pincode` VARCHAR(16) NULL,
    `city` VARCHAR(128) NULL,
    `state` VARCHAR(128) NULL,
    `locality` VARCHAR(128) NULL,
    `school_college_name` VARCHAR(255) NULL,
    `school_college_location_city` VARCHAR(128) NULL,
    `school_college_location_state` VARCHAR(128) NULL,
    `school_college_location_pin` VARCHAR(16) NULL,
    `instructor_name` VARCHAR(255) NULL,
    `preferred_discipline` VARCHAR(64) NULL,
    `training_center_id` CHAR(36) NULL,
    `training_center_name` VARCHAR(255) NULL,
    `profile_photo_url` VARCHAR(512) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
    `marketing_opt_in` BOOLEAN NOT NULL DEFAULT false,
    `terms_accepted_at` DATETIME(0) NULL,
    `validated_at` DATETIME(0) NULL,
    `validated_by` CHAR(36) NULL,
    `registration_id` VARCHAR(32) NULL,
    `enrollment_id` VARCHAR(64) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `students_user_id_key`(`user_id`),
    UNIQUE INDEX `students_registration_id_key`(`registration_id`),
    UNIQUE INDEX `students_enrollment_id_key`(`enrollment_id`),
    INDEX `students_user_id_idx`(`user_id`),
    INDEX `students_email_idx`(`email`),
    INDEX `students_status_idx`(`status`),
    INDEX `students_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructors` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(32) NULL,
    `bio` TEXT NULL,
    `city` VARCHAR(128) NULL,
    `state` VARCHAR(128) NULL,
    `profile_photo_url` VARCHAR(512) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `can_login` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `student_name` VARCHAR(255) NULL,
    `class_id` VARCHAR(64) NOT NULL,
    `class_name` VARCHAR(255) NOT NULL,
    `date` DATE NOT NULL,
    `status` VARCHAR(32) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `attendance_student_id_class_id_date_key`(`student_id`, `class_id`, `date`),
    INDEX `attendance_student_id_idx`(`student_id`),
    INDEX `attendance_date_idx`(`date`),
    INDEX `attendance_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pincode_lookup` (
    `pincode` VARCHAR(16) NOT NULL,
    `city` VARCHAR(128) NULL,
    `state` VARCHAR(128) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`pincode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_users` ADD CONSTRAINT `admin_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_training_center_id_fkey` FOREIGN KEY (`training_center_id`) REFERENCES `training_centers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
