-- AlterTable
ALTER TABLE "student_exams" ADD COLUMN     "isPractice" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "student_exams_isPractice_idx" ON "student_exams"("isPractice");
