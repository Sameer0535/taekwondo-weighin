import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import os from "os";

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a remote database URL is supplied (e.g. Postgres, MySQL, CockroachDB)
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  // Serverless Vercel / AWS Lambda environment where filesystem is read-only except /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = os.tmpdir();
    const tmpDbPath = path.join(tmpDir, "dev.db");

    // Copy initial SQLite dev.db to writable /tmp directory if not present
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        "/var/task/prisma/dev.db",
      ];

      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            console.log(`[PRISMA] Seeded /tmp SQLite database from: ${src}`);
            break;
          } catch (e) {
            console.error(`[PRISMA] Failed to copy SQLite db to /tmp:`, e);
          }
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  return envUrl || "file:./prisma/dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

