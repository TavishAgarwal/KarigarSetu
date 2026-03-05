-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArtisanProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "craftType" TEXT NOT NULL,
    "craftSpecialization" TEXT,
    "materialsUsed" TEXT,
    "techniquesUsed" TEXT,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "pincode" TEXT,
    "experienceYears" INTEGER NOT NULL,
    "productionCapacity" INTEGER,
    "workshopSize" INTEGER,
    "acceptsBulkOrders" BOOLEAN NOT NULL DEFAULT false,
    "shipsDomestic" BOOLEAN NOT NULL DEFAULT true,
    "shipsInternational" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT NOT NULL,
    "profileImage" TEXT,
    "bankAccount" TEXT,
    "ifscCode" TEXT,
    "upiId" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArtisanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ArtisanProfile" ("bio", "craftType", "createdAt", "experienceYears", "id", "location", "profileImage", "userId") SELECT "bio", "craftType", "createdAt", "experienceYears", "id", "location", "profileImage", "userId" FROM "ArtisanProfile";
DROP TABLE "ArtisanProfile";
ALTER TABLE "new_ArtisanProfile" RENAME TO "ArtisanProfile";
CREATE UNIQUE INDEX "ArtisanProfile_userId_key" ON "ArtisanProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
