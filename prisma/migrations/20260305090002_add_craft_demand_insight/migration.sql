-- CreateTable
CREATE TABLE "CraftDemandInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "craftType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "demandLevel" TEXT NOT NULL,
    "popularStyles" TEXT NOT NULL,
    "popularColors" TEXT NOT NULL,
    "avgPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
