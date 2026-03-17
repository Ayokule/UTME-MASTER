/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `optionA` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `optionB` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `optionC` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `optionD` on the `questions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "exam_questions" DROP CONSTRAINT "exam_questions_questionId_fkey";

-- DropForeignKey
ALTER TABLE "student_answers" DROP CONSTRAINT "student_answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "student_exams" DROP CONSTRAINT "student_exams_examId_fkey";

-- DropForeignKey
ALTER TABLE "student_exams" DROP CONSTRAINT "student_exams_studentId_fkey";

-- DropForeignKey
ALTER TABLE "student_progress" DROP CONSTRAINT "student_progress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_subjectId_fkey";

-- DropIndex
DROP INDEX "questions_topicId_idx";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "imageUrl",
DROP COLUMN "optionA",
DROP COLUMN "optionB",
DROP COLUMN "optionC",
DROP COLUMN "optionD";

-- CreateIndex
CREATE INDEX "exams_createdAt_idx" ON "exams"("createdAt");

-- CreateIndex
CREATE INDEX "questions_subjectId_difficulty_idx" ON "questions"("subjectId", "difficulty");

-- CreateIndex
CREATE INDEX "student_answers_studentExamId_questionId_idx" ON "student_answers"("studentExamId", "questionId");

-- CreateIndex
CREATE INDEX "student_exams_studentId_status_idx" ON "student_exams"("studentId", "status");

-- CreateIndex
CREATE INDEX "student_exams_createdAt_idx" ON "student_exams"("createdAt");

-- CreateIndex
CREATE INDEX "users_licenseTier_idx" ON "users"("licenseTier");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exams" ADD CONSTRAINT "student_exams_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exams" ADD CONSTRAINT "student_exams_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
