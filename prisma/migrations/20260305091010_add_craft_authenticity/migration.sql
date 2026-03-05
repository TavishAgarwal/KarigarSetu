-- CreateTable
CREATE TABLE "CraftAuthenticity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "authenticityScore" REAL NOT NULL,
    "handmadeSignals" TEXT NOT NULL,
    "machineSignals" TEXT NOT NULL,
    "verificationSummary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CraftAuthenticity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CraftAuthenticity_productId_key" ON "CraftAuthenticity"("productId");
