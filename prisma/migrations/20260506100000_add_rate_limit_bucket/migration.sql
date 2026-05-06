CREATE TABLE `RateLimitBucket` (
  `key` VARCHAR(191) NOT NULL,
  `count` INTEGER NOT NULL DEFAULT 1,
  `resetAt` DATETIME(3) NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`key`)
);
