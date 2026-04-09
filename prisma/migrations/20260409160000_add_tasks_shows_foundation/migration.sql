CREATE TYPE "TaskStatus" AS ENUM ('Open', 'InProgress', 'Completed');
CREATE TYPE "TaskPriority" AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE "TaskRelatedEntityType" AS ENUM ('Bird', 'Chick', 'HatchGroup', 'Customer', 'Order', 'Reservation', 'Show', 'Other');

CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "TaskStatus" NOT NULL DEFAULT 'Open',
    "priority" "TaskPriority" NOT NULL DEFAULT 'Medium',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "relatedEntityType" "TaskRelatedEntityType" NOT NULL DEFAULT 'Other',
    "relatedEntityId" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showName" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShowEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "birdId" TEXT NOT NULL,
    "entryClass" TEXT NOT NULL DEFAULT '',
    "result" TEXT NOT NULL DEFAULT '',
    "judgeNotes" TEXT NOT NULL DEFAULT '',
    "placement" TEXT NOT NULL DEFAULT '',
    "isWin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Task_userId_idx" ON "Task"("userId");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_priority_idx" ON "Task"("priority");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
CREATE INDEX "Show_userId_idx" ON "Show"("userId");
CREATE INDEX "Show_date_idx" ON "Show"("date");
CREATE INDEX "ShowEntry_userId_idx" ON "ShowEntry"("userId");
CREATE INDEX "ShowEntry_showId_idx" ON "ShowEntry"("showId");
CREATE INDEX "ShowEntry_birdId_idx" ON "ShowEntry"("birdId");

ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Show" ADD CONSTRAINT "Show_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowEntry" ADD CONSTRAINT "ShowEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowEntry" ADD CONSTRAINT "ShowEntry_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShowEntry" ADD CONSTRAINT "ShowEntry_birdId_fkey" FOREIGN KEY ("birdId") REFERENCES "Bird"("id") ON DELETE CASCADE ON UPDATE CASCADE;
