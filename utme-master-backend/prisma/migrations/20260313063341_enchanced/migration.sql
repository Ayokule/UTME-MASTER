/*
  Warnings:

  - You are about to drop the column `created_at` on the `exam_questions` table. All the data in the column will be lost.
  - You are about to drop the column `exam_id` on the `exam_questions` table. All the data in the column will be lost.
  - You are about to drop the column `order_number` on the `exam_questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_data` on the `exam_questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `exam_questions` table. All the data in the column will be lost.
  - You are about to drop the column `allow_retake` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `allow_review` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `ends_at` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `pass_marks` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `questions_per_subject` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `randomize_options` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `randomize_questions` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `show_results` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `starts_at` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `subject_ids` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `total_marks` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `total_questions` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `year_from` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `year_to` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `computer_name` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `cpu_id` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `error_message` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `hardware_fingerprint` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `license_id` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `mac_address` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `motherboard_serial` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `os_version` on the `license_activations` table. All the data in the column will be lost.
  - You are about to drop the column `activated_at` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `auto_renew` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `contact_email` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `contact_phone` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `current_questions` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `current_students` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `expiry_date` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `hardware_fingerprint` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `is_activated` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `last_renewal_date` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `license_key` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `max_questions` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `max_students` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `organization_name` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `purchase_date` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `trial_end_date` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `trial_start_date` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `licenses` table. All the data in the column will be lost.
  - You are about to drop the column `allow_multiple` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `audio_url` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answer` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `exam_type` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_a` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_b` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_c` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `option_d` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `question_type` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `time_limit_seconds` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `topic_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `answered_at` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `flagged_for_review` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `is_correct` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `points_earned` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `student_exam_id` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `time_spent` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `student_answers` table. All the data in the column will be lost.
  - You are about to drop the column `answered_questions` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `auto_submitted` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answers` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `exam_id` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `question_order` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_at` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `time_remaining` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `time_spent` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `total_questions` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `wrong_answers` on the `student_exams` table. All the data in the column will be lost.
  - You are about to drop the column `average_score` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `correct_answers` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `last_practice_date` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `total_questions` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `wrong_answers` on the `student_progress` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `license_expires_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `license_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `license_tier` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[examId,questionId]` on the table `exam_questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[licenseKey]` on the table `licenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hardwareFingerprint]` on the table `licenses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentExamId,questionId]` on the table `student_answers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[examId,studentId]` on the table `student_exams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,subjectId]` on the table `student_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `examId` to the `exam_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `exam_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionData` to the `exam_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `exam_questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passMarks` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectIds` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMarks` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpuId` to the `license_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hardwareFingerprint` to the `license_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseId` to the `license_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `macAddress` to the `license_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherboardSerial` to the `license_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseKey` to the `licenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `licenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `student_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentExamId` to the `student_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `student_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examId` to the `student_exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionOrder` to the `student_exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `student_exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `student_exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `student_exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `student_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `student_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `student_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `topics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `topics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "exam_questions" DROP CONSTRAINT "exam_questions_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_questions" DROP CONSTRAINT "exam_questions_question_id_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_created_by_fkey";

-- DropForeignKey
ALTER TABLE "license_activations" DROP CONSTRAINT "license_activations_license_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "student_answers" DROP CONSTRAINT "student_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "student_answers" DROP CONSTRAINT "student_answers_student_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "student_exams" DROP CONSTRAINT "student_exams_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "student_exams" DROP CONSTRAINT "student_exams_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_progress" DROP CONSTRAINT "student_progress_student_id_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_subject_id_fkey";

-- DropIndex
DROP INDEX "exam_questions_exam_id_idx";

-- DropIndex
DROP INDEX "exam_questions_exam_id_question_id_key";

-- DropIndex
DROP INDEX "exam_questions_question_id_idx";

-- DropIndex
DROP INDEX "exams_created_by_idx";

-- DropIndex
DROP INDEX "exams_is_published_is_active_idx";

-- DropIndex
DROP INDEX "license_activations_hardware_fingerprint_idx";

-- DropIndex
DROP INDEX "license_activations_license_id_idx";

-- DropIndex
DROP INDEX "licenses_hardware_fingerprint_idx";

-- DropIndex
DROP INDEX "licenses_hardware_fingerprint_key";

-- DropIndex
DROP INDEX "licenses_license_key_idx";

-- DropIndex
DROP INDEX "licenses_license_key_key";

-- DropIndex
DROP INDEX "questions_created_by_idx";

-- DropIndex
DROP INDEX "questions_exam_type_idx";

-- DropIndex
DROP INDEX "questions_subject_id_idx";

-- DropIndex
DROP INDEX "questions_topic_id_idx";

-- DropIndex
DROP INDEX "student_answers_question_id_idx";

-- DropIndex
DROP INDEX "student_answers_student_exam_id_idx";

-- DropIndex
DROP INDEX "student_answers_student_exam_id_question_id_key";

-- DropIndex
DROP INDEX "student_exams_exam_id_idx";

-- DropIndex
DROP INDEX "student_exams_exam_id_student_id_key";

-- DropIndex
DROP INDEX "student_exams_student_id_idx";

-- DropIndex
DROP INDEX "student_progress_student_id_idx";

-- DropIndex
DROP INDEX "student_progress_student_id_subject_id_key";

-- DropIndex
DROP INDEX "student_progress_subject_id_idx";

-- DropIndex
DROP INDEX "topics_subject_id_idx";

-- AlterTable
ALTER TABLE "exam_questions" DROP COLUMN "created_at",
DROP COLUMN "exam_id",
DROP COLUMN "order_number",
DROP COLUMN "question_data",
DROP COLUMN "question_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "examId" TEXT NOT NULL,
ADD COLUMN     "orderNumber" INTEGER NOT NULL,
ADD COLUMN     "questionData" JSONB NOT NULL,
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "allow_retake",
DROP COLUMN "allow_review",
DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "ends_at",
DROP COLUMN "is_active",
DROP COLUMN "is_published",
DROP COLUMN "pass_marks",
DROP COLUMN "questions_per_subject",
DROP COLUMN "randomize_options",
DROP COLUMN "randomize_questions",
DROP COLUMN "show_results",
DROP COLUMN "starts_at",
DROP COLUMN "subject_ids",
DROP COLUMN "total_marks",
DROP COLUMN "total_questions",
DROP COLUMN "updated_at",
DROP COLUMN "year_from",
DROP COLUMN "year_to",
ADD COLUMN     "allowRetake" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowReview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passMarks" INTEGER NOT NULL,
ADD COLUMN     "questionsPerSubject" JSONB,
ADD COLUMN     "randomizeOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startsAt" TIMESTAMP(3),
ADD COLUMN     "subjectIds" JSONB NOT NULL,
ADD COLUMN     "totalMarks" INTEGER NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yearFrom" INTEGER,
ADD COLUMN     "yearTo" INTEGER;

-- AlterTable
ALTER TABLE "license_activations" DROP COLUMN "computer_name",
DROP COLUMN "cpu_id",
DROP COLUMN "created_at",
DROP COLUMN "error_message",
DROP COLUMN "hardware_fingerprint",
DROP COLUMN "ip_address",
DROP COLUMN "license_id",
DROP COLUMN "mac_address",
DROP COLUMN "motherboard_serial",
DROP COLUMN "os_version",
ADD COLUMN     "computerName" TEXT,
ADD COLUMN     "cpuId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "hardwareFingerprint" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "licenseId" TEXT NOT NULL,
ADD COLUMN     "macAddress" TEXT NOT NULL,
ADD COLUMN     "motherboardSerial" TEXT NOT NULL,
ADD COLUMN     "osVersion" TEXT;

-- AlterTable
ALTER TABLE "licenses" DROP COLUMN "activated_at",
DROP COLUMN "auto_renew",
DROP COLUMN "contact_email",
DROP COLUMN "contact_phone",
DROP COLUMN "created_at",
DROP COLUMN "current_questions",
DROP COLUMN "current_students",
DROP COLUMN "expiry_date",
DROP COLUMN "hardware_fingerprint",
DROP COLUMN "is_activated",
DROP COLUMN "last_renewal_date",
DROP COLUMN "license_key",
DROP COLUMN "max_questions",
DROP COLUMN "max_students",
DROP COLUMN "organization_name",
DROP COLUMN "purchase_date",
DROP COLUMN "trial_end_date",
DROP COLUMN "trial_start_date",
DROP COLUMN "updated_at",
ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentStudents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "hardwareFingerprint" TEXT,
ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastRenewalDate" TIMESTAMP(3),
ADD COLUMN     "licenseKey" TEXT NOT NULL,
ADD COLUMN     "maxQuestions" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "maxStudents" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "allow_multiple",
DROP COLUMN "audio_url",
DROP COLUMN "correct_answer",
DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "exam_type",
DROP COLUMN "image_url",
DROP COLUMN "is_active",
DROP COLUMN "option_a",
DROP COLUMN "option_b",
DROP COLUMN "option_c",
DROP COLUMN "option_d",
DROP COLUMN "question_text",
DROP COLUMN "question_type",
DROP COLUMN "subject_id",
DROP COLUMN "time_limit_seconds",
DROP COLUMN "topic_id",
DROP COLUMN "updated_at",
DROP COLUMN "video_url",
ADD COLUMN     "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "examType" "ExamType" NOT NULL DEFAULT 'JAMB',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "optionA" TEXT,
ADD COLUMN     "optionB" TEXT,
ADD COLUMN     "optionC" TEXT,
ADD COLUMN     "optionD" TEXT,
ADD COLUMN     "questionText" TEXT NOT NULL,
ADD COLUMN     "questionType" "QuestionType" NOT NULL DEFAULT 'MCQ',
ADD COLUMN     "subjectId" TEXT NOT NULL,
ADD COLUMN     "timeLimitSeconds" INTEGER,
ADD COLUMN     "topicId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "student_answers" DROP COLUMN "answered_at",
DROP COLUMN "created_at",
DROP COLUMN "flagged_for_review",
DROP COLUMN "is_correct",
DROP COLUMN "points_earned",
DROP COLUMN "question_id",
DROP COLUMN "student_exam_id",
DROP COLUMN "time_spent",
DROP COLUMN "updated_at",
ADD COLUMN     "answeredAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCorrect" BOOLEAN,
ADD COLUMN     "pointsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "questionId" TEXT NOT NULL,
ADD COLUMN     "studentExamId" TEXT NOT NULL,
ADD COLUMN     "timeSpent" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_exams" DROP COLUMN "answered_questions",
DROP COLUMN "auto_submitted",
DROP COLUMN "correct_answers",
DROP COLUMN "created_at",
DROP COLUMN "exam_id",
DROP COLUMN "question_order",
DROP COLUMN "started_at",
DROP COLUMN "student_id",
DROP COLUMN "submitted_at",
DROP COLUMN "time_remaining",
DROP COLUMN "time_spent",
DROP COLUMN "total_questions",
DROP COLUMN "updated_at",
DROP COLUMN "wrong_answers",
ADD COLUMN     "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "correctAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "examId" TEXT NOT NULL,
ADD COLUMN     "questionOrder" JSONB NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "timeRemaining" INTEGER,
ADD COLUMN     "timeSpent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL,
ADD COLUMN     "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wrongAnswers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "student_progress" DROP COLUMN "average_score",
DROP COLUMN "correct_answers",
DROP COLUMN "created_at",
DROP COLUMN "last_practice_date",
DROP COLUMN "student_id",
DROP COLUMN "subject_id",
DROP COLUMN "total_questions",
DROP COLUMN "updated_at",
DROP COLUMN "wrong_answers",
ADD COLUMN     "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "correctAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastPracticeDate" TIMESTAMP(3),
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "subjectId" TEXT NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wrongAnswers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "created_at",
DROP COLUMN "is_active",
DROP COLUMN "subject_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subjectId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "is_active",
DROP COLUMN "last_login",
DROP COLUMN "last_name",
DROP COLUMN "license_expires_at",
DROP COLUMN "license_id",
DROP COLUMN "license_tier",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "licenseExpiresAt" TIMESTAMP(3),
ADD COLUMN     "licenseId" TEXT,
ADD COLUMN     "licenseTier" "LicenseTier" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "exam_questions_examId_idx" ON "exam_questions"("examId");

-- CreateIndex
CREATE INDEX "exam_questions_questionId_idx" ON "exam_questions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_questions_examId_questionId_key" ON "exam_questions"("examId", "questionId");

-- CreateIndex
CREATE INDEX "exams_createdBy_idx" ON "exams"("createdBy");

-- CreateIndex
CREATE INDEX "exams_isPublished_isActive_idx" ON "exams"("isPublished", "isActive");

-- CreateIndex
CREATE INDEX "license_activations_hardwareFingerprint_idx" ON "license_activations"("hardwareFingerprint");

-- CreateIndex
CREATE INDEX "license_activations_licenseId_idx" ON "license_activations"("licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_licenseKey_key" ON "licenses"("licenseKey");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_hardwareFingerprint_key" ON "licenses"("hardwareFingerprint");

-- CreateIndex
CREATE INDEX "licenses_hardwareFingerprint_idx" ON "licenses"("hardwareFingerprint");

-- CreateIndex
CREATE INDEX "licenses_licenseKey_idx" ON "licenses"("licenseKey");

-- CreateIndex
CREATE INDEX "questions_createdBy_idx" ON "questions"("createdBy");

-- CreateIndex
CREATE INDEX "questions_examType_idx" ON "questions"("examType");

-- CreateIndex
CREATE INDEX "questions_subjectId_idx" ON "questions"("subjectId");

-- CreateIndex
CREATE INDEX "questions_topicId_idx" ON "questions"("topicId");

-- CreateIndex
CREATE INDEX "student_answers_questionId_idx" ON "student_answers"("questionId");

-- CreateIndex
CREATE INDEX "student_answers_studentExamId_idx" ON "student_answers"("studentExamId");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_studentExamId_questionId_key" ON "student_answers"("studentExamId", "questionId");

-- CreateIndex
CREATE INDEX "student_exams_examId_idx" ON "student_exams"("examId");

-- CreateIndex
CREATE INDEX "student_exams_studentId_idx" ON "student_exams"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_exams_examId_studentId_key" ON "student_exams"("examId", "studentId");

-- CreateIndex
CREATE INDEX "student_progress_studentId_idx" ON "student_progress"("studentId");

-- CreateIndex
CREATE INDEX "student_progress_subjectId_idx" ON "student_progress"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_studentId_subjectId_key" ON "student_progress"("studentId", "subjectId");

-- CreateIndex
CREATE INDEX "topics_subjectId_idx" ON "topics"("subjectId");

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_studentExamId_fkey" FOREIGN KEY ("studentExamId") REFERENCES "student_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exams" ADD CONSTRAINT "student_exams_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_exams" ADD CONSTRAINT "student_exams_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
