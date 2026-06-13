CREATE TABLE `chat_threads` (
  `id` CHAR(36) NOT NULL,
  `public_token` VARCHAR(128) NOT NULL,
  `visitor_name` VARCHAR(255) NOT NULL,
  `visitor_email` VARCHAR(255) NULL,
  `visitor_phone` VARCHAR(32) NULL,
  `visitor_role` ENUM('PARENT','STUDENT','INSTRUCTOR','ACADEMY','OTHER') NOT NULL DEFAULT 'OTHER',
  `user_id` CHAR(36) NULL,
  `student_id` CHAR(36) NULL,
  `instructor_id` CHAR(36) NULL,
  `source_type` VARCHAR(64) NULL,
  `source_page` VARCHAR(512) NULL,
  `campaign_source` VARCHAR(128) NULL,
  `utm_source` VARCHAR(128) NULL,
  `utm_medium` VARCHAR(128) NULL,
  `utm_campaign` VARCHAR(128) NULL,
  `subject` VARCHAR(255) NULL,
  `status` ENUM('NEW','OPEN','ASSIGNED','WAITING_FOR_VISITOR','WAITING_FOR_ADMIN','RESOLVED','CLOSED','SPAM') NOT NULL DEFAULT 'NEW',
  `priority` VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
  `assigned_admin_id` CHAR(36) NULL,
  `bot_enabled` BOOLEAN NOT NULL DEFAULT true,
  `bot_handoff_required` BOOLEAN NOT NULL DEFAULT false,
  `last_message_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  `closed_at` DATETIME(0) NULL,
  UNIQUE INDEX `chat_threads_public_token_key` (`public_token`),
  INDEX `chat_threads_status_idx` (`status`),
  INDEX `chat_threads_assigned_admin_id_idx` (`assigned_admin_id`),
  INDEX `chat_threads_visitor_email_idx` (`visitor_email`),
  INDEX `chat_threads_visitor_phone_idx` (`visitor_phone`),
  INDEX `chat_threads_last_message_at_idx` (`last_message_at`),
  INDEX `chat_threads_created_at_idx` (`created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `id` CHAR(36) NOT NULL,
  `thread_id` CHAR(36) NOT NULL,
  `sender_type` ENUM('VISITOR','STUDENT','INSTRUCTOR','ADMIN','BOT','SYSTEM') NOT NULL,
  `sender_user_id` CHAR(36) NULL,
  `sender_admin_id` CHAR(36) NULL,
  `message_type` ENUM('TEXT','IMAGE','DOCUMENT','URL','SYSTEM','BOT_SUGGESTION','BOT_HANDOFF') NOT NULL DEFAULT 'TEXT',
  `message_text` TEXT NULL,
  `metadata_json` JSON NULL,
  `is_internal` BOOLEAN NOT NULL DEFAULT false,
  `is_read` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` DATETIME(0) NOT NULL,
  INDEX `chat_messages_thread_id_created_at_idx` (`thread_id`, `created_at`),
  INDEX `chat_messages_sender_admin_id_idx` (`sender_admin_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_attachments` (
  `id` CHAR(36) NOT NULL,
  `message_id` CHAR(36) NOT NULL,
  `thread_id` CHAR(36) NOT NULL,
  `uploaded_by_type` ENUM('VISITOR','STUDENT','INSTRUCTOR','ADMIN','BOT','SYSTEM') NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(512) NOT NULL,
  `file_mime_type` VARCHAR(128) NOT NULL,
  `file_size` INTEGER NOT NULL,
  `file_category` ENUM('IMAGE','PDF','DOCUMENT','SPREADSHEET','VIDEO','AUDIO','OTHER') NOT NULL,
  `storage_path` VARCHAR(512) NOT NULL,
  `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  INDEX `chat_attachments_message_id_idx` (`message_id`),
  INDEX `chat_attachments_thread_id_idx` (`thread_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `chat_threads` ADD CONSTRAINT `chat_threads_assigned_admin_id_fkey` FOREIGN KEY (`assigned_admin_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `chat_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_user_id_fkey` FOREIGN KEY (`sender_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sender_admin_id_fkey` FOREIGN KEY (`sender_admin_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `chat_attachments` ADD CONSTRAINT `chat_attachments_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `chat_attachments` ADD CONSTRAINT `chat_attachments_thread_id_fkey` FOREIGN KEY (`thread_id`) REFERENCES `chat_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
