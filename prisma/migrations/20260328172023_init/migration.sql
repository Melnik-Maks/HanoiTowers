-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('child', 'admin');

-- CreateEnum
CREATE TYPE "LevelSource" AS ENUM ('classic', 'json');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('draft', 'active', 'finished');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('joined', 'in_progress', 'finished');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'child',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "LevelSource" NOT NULL,
    "jsonLevelId" INTEGER,
    "classicDisks" INTEGER,
    "durationMs" INTEGER NOT NULL,
    "moves" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'draft',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentLevel" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "jsonLevelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentParticipant" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'joined',
    "currentLevelIndex" INTEGER NOT NULL DEFAULT 0,
    "completedLevels" INTEGER NOT NULL DEFAULT 0,
    "totalDurationMs" INTEGER NOT NULL DEFAULT 0,
    "totalMoves" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentLevelResult" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "tournamentLevelId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "jsonLevelId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "moves" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentLevelResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "GameResult_userId_completedAt_idx" ON "GameResult"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_code_key" ON "Tournament"("code");

-- CreateIndex
CREATE INDEX "Tournament_createdById_createdAt_idx" ON "Tournament"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "TournamentLevel_tournamentId_jsonLevelId_idx" ON "TournamentLevel"("tournamentId", "jsonLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentLevel_tournamentId_orderIndex_key" ON "TournamentLevel"("tournamentId", "orderIndex");

-- CreateIndex
CREATE INDEX "TournamentParticipant_tournamentId_status_idx" ON "TournamentParticipant"("tournamentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentParticipant_tournamentId_userId_key" ON "TournamentParticipant"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "TournamentLevelResult_tournamentId_completedAt_idx" ON "TournamentLevelResult"("tournamentId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentLevelResult_participantId_tournamentLevelId_key" ON "TournamentLevelResult"("participantId", "tournamentLevelId");

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLevel" ADD CONSTRAINT "TournamentLevel_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentParticipant" ADD CONSTRAINT "TournamentParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLevelResult" ADD CONSTRAINT "TournamentLevelResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLevelResult" ADD CONSTRAINT "TournamentLevelResult_tournamentLevelId_fkey" FOREIGN KEY ("tournamentLevelId") REFERENCES "TournamentLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentLevelResult" ADD CONSTRAINT "TournamentLevelResult_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "TournamentParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
