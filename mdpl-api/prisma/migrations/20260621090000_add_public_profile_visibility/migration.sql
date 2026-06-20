-- Public profiles are opt-in. Existing records remain private by default.
ALTER TABLE `instructors`
    ADD COLUMN `public_profile_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `public_display_name` VARCHAR(255) NULL,
    ADD COLUMN `public_slug` VARCHAR(255) NULL,
    ADD COLUMN `public_bio` VARCHAR(1000) NULL,
    ADD COLUMN `public_photo_url` VARCHAR(512) NULL,
    ADD COLUMN `public_display_order` INTEGER NULL,
    ADD COLUMN `is_featured_public` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `public_approved_by_user_id` CHAR(36) NULL,
    ADD COLUMN `public_approved_at` DATETIME(0) NULL,
    ADD COLUMN `public_updated_at` DATETIME(0) NULL;

CREATE UNIQUE INDEX `instructors_public_slug_key` ON `instructors`(`public_slug`);

ALTER TABLE `training_centers`
    ADD COLUMN `public_profile_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `public_display_name` VARCHAR(255) NULL,
    ADD COLUMN `public_slug` VARCHAR(255) NULL,
    ADD COLUMN `public_bio` VARCHAR(1000) NULL,
    ADD COLUMN `public_photo_url` VARCHAR(512) NULL,
    ADD COLUMN `public_display_order` INTEGER NULL,
    ADD COLUMN `is_featured_public` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `public_approved_by_user_id` CHAR(36) NULL,
    ADD COLUMN `public_approved_at` DATETIME(0) NULL,
    ADD COLUMN `public_updated_at` DATETIME(0) NULL;

CREATE UNIQUE INDEX `training_centers_public_slug_key` ON `training_centers`(`public_slug`);
