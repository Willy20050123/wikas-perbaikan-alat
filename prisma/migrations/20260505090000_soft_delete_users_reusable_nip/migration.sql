ALTER TABLE `User`
ADD COLUMN `activeNip` VARCHAR(191) NULL,
ADD COLUMN `deletedAt` DATETIME(3) NULL;

UPDATE `User`
SET `activeNip` = `nip`
WHERE `deletedAt` IS NULL AND `nip` IS NOT NULL;

DROP INDEX `User_nip_key` ON `User`;

CREATE UNIQUE INDEX `User_activeNip_key` ON `User`(`activeNip`);

ALTER TABLE `Report`
DROP FOREIGN KEY `Report_userId_fkey`;

ALTER TABLE `Report`
ADD CONSTRAINT `Report_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;
