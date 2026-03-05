-- CreateTable
CREATE TABLE "ProductionInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artisanId" TEXT NOT NULL,
    "craftType" TEXT NOT NULL,
    "recommendedProducts" TEXT NOT NULL,
    "demandSignals" TEXT NOT NULL,
    "productionSuggestion" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductionInsight_artisanId_fkey" FOREIGN KEY ("artisanId") REFERENCES "ArtisanProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
