-- CreateTable
CREATE TABLE "PriceInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    "craftType" TEXT NOT NULL,
    "recommendedPrice" REAL NOT NULL,
    "priceRangeMin" REAL NOT NULL,
    "priceRangeMax" REAL NOT NULL,
    "globalAverage" REAL NOT NULL,
    "demandLevel" TEXT NOT NULL,
    "targetMarkets" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
