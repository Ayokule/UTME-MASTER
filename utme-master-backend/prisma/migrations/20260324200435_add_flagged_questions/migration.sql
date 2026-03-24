-- CreateTable
CREATE TABLE "flagged_questions" (
    "id" TEXT NOT NULL,
    "studentExamId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flagged_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flagged_questions_examId_idx" ON "flagged_questions"("examId");

-- CreateIndex
CREATE INDEX "flagged_questions_questionId_idx" ON "flagged_questions"("questionId");

-- CreateIndex
CREATE INDEX "flagged_questions_studentId_idx" ON "flagged_questions"("studentId");

-- CreateIndex
CREATE INDEX "flagged_questions_status_idx" ON "flagged_questions"("status");

-- CreateIndex
CREATE INDEX "flagged_questions_createdAt_idx" ON "flagged_questions"("createdAt");
