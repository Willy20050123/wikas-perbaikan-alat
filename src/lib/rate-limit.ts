import "server-only";

import { prisma } from "@/src/lib/prisma";

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function isRateLimited(
  key: string,
  options: { limit: number; windowMs: number }
): Promise<boolean> {
  return checkRateLimit(key, options);
}

async function pruneExpiredBuckets(now: Date) {
  await prisma.rateLimitBucket.deleteMany({
    where: {
      resetAt: {
        lte: now,
      },
    },
  });
}

async function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + options.windowMs);

  if (Math.random() < 0.02) {
    await pruneExpiredBuckets(now);
  }

  const current = await prisma.rateLimitBucket.findUnique({
    where: { key },
  });

  if (!current || current.resetAt <= now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      update: {
        count: 1,
        resetAt,
      },
      create: {
        key,
        count: 1,
        resetAt,
      },
    });

    return false;
  }

  const updated = await prisma.rateLimitBucket.update({
    where: { key },
    data: {
      count: {
        increment: 1,
      },
    },
  });

  return updated.count > options.limit;
}

export async function clearRateLimit(key: string) {
  await prisma.rateLimitBucket.delete({
    where: { key },
  }).catch((error: { code?: string }) => {
    if (error.code !== "P2025") {
      throw error;
    }
  });
}
