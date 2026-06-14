ALTER TABLE `users`
  ADD COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN `last_login_at` DATETIME(0) NULL;

CREATE INDEX `users_status_idx` ON `users`(`status`);
