ALTER TABLE `User`
ADD COLUMN `jabatan` VARCHAR(191) NULL;

CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `kategori` ENUM('FASILITAS_INVENTARIS', 'IT_ELEKTRONIK', 'LABORATORIUM') NOT NULL,
    `namaBarang` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `severity` ENUM('RINGAN', 'SEDANG', 'BERAT') NOT NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `status` ENUM('MENUNGGU', 'DISETUJUI', 'DITOLAK', 'DIPROSES', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU',
    `alasanPenolakan` VARCHAR(191) NULL,
    `assignedTechnician` VARCHAR(191) NULL,
    `adminNotes` VARCHAR(191) NULL,
    `completionNotes` VARCHAR(191) NULL,
    `completionPhotoUrl` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `processedAt` DATETIME(3) NULL,
    `finishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Report_userId_idx`(`userId`),
    INDEX `Report_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Report_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PasswordResetToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    INDEX `PasswordResetToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Report`
ADD CONSTRAINT `Report_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `PasswordResetToken`
ADD CONSTRAINT `PasswordResetToken_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
