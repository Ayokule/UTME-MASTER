/*
  Warnings:

  - A unique constraint covering the columns `[name,subjectId]` on the table `topics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_subjectId_fkey";

-- DropIndex
DROP INDEX "student_answers_studentExamId_questionId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_subjectId_key" ON "topics"("name", "subjectId");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
