-- AlterTable
ALTER TABLE `queue` ADD COLUMN `gaveUp` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `leftAt` DATETIME(3) NULL,
    ADD COLUMN `served` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `waitTime` INTEGER NULL;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `averageServiceTime` INTEGER NULL;
