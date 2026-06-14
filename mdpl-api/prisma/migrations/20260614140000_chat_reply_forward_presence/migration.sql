-- AlterTable
ALTER TABLE `admin_users` ADD COLUMN `last_seen_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `chat_messages` ADD COLUMN `reply_to_message_id` CHAR(36) NULL,
    ADD COLUMN `forwarded_from_message_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `chat_messages_reply_to_message_id_idx` ON `chat_messages`(`reply_to_message_id`);

-- CreateIndex
CREATE INDEX `chat_messages_forwarded_from_message_id_idx` ON `chat_messages`(`forwarded_from_message_id`);

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_reply_to_message_id_fkey` FOREIGN KEY (`reply_to_message_id`) REFERENCES `chat_messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_forwarded_from_message_id_fkey` FOREIGN KEY (`forwarded_from_message_id`) REFERENCES `chat_messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
