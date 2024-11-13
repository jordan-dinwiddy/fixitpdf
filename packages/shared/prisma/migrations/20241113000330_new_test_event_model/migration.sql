-- CreateTable
CREATE TABLE "TestEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "lagMs" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "TestEvent_pkey" PRIMARY KEY ("id")
);
