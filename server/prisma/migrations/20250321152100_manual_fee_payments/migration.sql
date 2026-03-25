-- CreateTable (Month 2 - Manual Fee Payments)
CREATE TABLE `fee_requests` (
    `id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `training_center_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `amount_paise` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `due_date` DATE NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'OVERDUE', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
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
    `method` ENUM('UPI', 'CASH', 'BANK_TRANSFER', 'CHEQUE', 'OTHER') NOT NULL,
    `amount_paise` INTEGER NOT NULL,
    `paid_at` DATETIME(0) NULL,
    `reference` VARCHAR(128) NULL,
    `proof_url` VARCHAR(512) NULL,
    `notes_from_student` TEXT NULL,
    `status` ENUM('SUBMITTED', 'NEEDS_INFO', 'VERIFIED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
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
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('FEE_REQUEST_ISSUED', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PAYMENT_NEEDS_INFO', 'PAYMENT_REJECTED') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `entity_type` ENUM('fee_request', 'payment_submission') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `read_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `notifications_user_id_read_at_idx`(`user_id`, `read_at`),
    INDEX `notifications_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
