import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  try {
    // ==========================================
    // CREATE SUPER ADMIN ACCOUNT
    // ==========================================
    console.log('👤 Creating super admin account...')

    const superAdminEmail = process.env.ADMIN_EMAIL || 'admin@owner.com'
    const superAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234'
    const superAdminHash = await bcrypt.hash(superAdminPassword, 10)

    const superAdmin = await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {},
      create: {
        id: randomUUID(),
        email: superAdminEmail,
        password: superAdminHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        licenseTier: 'ENTERPRISE',
        isActive: true,
      },
    })
    console.log(`✅ Super admin created: ${superAdmin.email}\n`)

    // ==========================================
    // CREATE ADMIN ACCOUNT
    // ==========================================
    console.log('👤 Creating admin account...')

    const adminHash = await bcrypt.hash('Admin@123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@utmemaster.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'admin@utmemaster.com',
        password: adminHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        licenseTier: 'ENTERPRISE',
        isActive: true,
      },
    })
    console.log(`✅ Admin created: ${admin.email}\n`)

    // ==========================================
    // CREATE TEACHER ACCOUNT
    // ==========================================
    console.log('👩‍🏫 Creating teacher account...')

    const teacherHash = await bcrypt.hash('Teacher@123', 10)
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@utmemaster.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'teacher@utmemaster.com',
        password: teacherHash,
        firstName: 'Teacher',
        lastName: 'Demo',
        role: 'TEACHER',
        licenseTier: 'PREMIUM',
        isActive: true,
      },
    })
    console.log(`✅ Teacher created: ${teacher.email}\n`)

    // ==========================================
    // CREATE STUDENT ACCOUNTS
    // ==========================================
    console.log('👤 Creating student accounts...')

    const studentHash = await bcrypt.hash('Student@123', 10)
    const students = []

    for (let i = 1; i <= 3; i++) {
      const student = await prisma.user.upsert({
        where: { email: `student${i}@test.com` },
        update: {},
        create: {
          id: randomUUID(),
          email: `student${i}@test.com`,
          password: studentHash,
          firstName: 'Student',
          lastName: `${i}`,
          role: 'STUDENT',
          licenseTier: 'TRIAL',
          isActive: true,
        },
      })
      students.push(student)
      console.log(`✅ Student created: ${student.email}`)
    }
    console.log()

    // ==========================================
    // CREATE SUBJECTS
    // ==========================================
    console.log('📚 Creating subjects...')

    const subjectData = [
      { name: 'English Language', code: 'ENG', description: 'Use of English and comprehension' },
      { name: 'Mathematics', code: 'MTH', description: 'Arithmetic, Algebra, Geometry, Calculus' },
      { name: 'Physics', code: 'PHY', description: 'Mechanics, Electricity, Waves, Modern Physics' },
      { name: 'Chemistry', code: 'CHM', description: 'Organic, Inorganic, Physical Chemistry' },
      { name: 'Biology', code: 'BIO', description: 'Botany, Zoology, Ecology, Genetics' },
      { name: 'Economics', code: 'ECO', description: 'Microeconomics, Macroeconomics' },
      { name: 'Government', code: 'GOV', description: 'Political systems, Governance' },
      { name: 'Commerce', code: 'COM', description: 'Trade, Business, Accounting' },
      { name: 'Literature in English', code: 'LIT', description: 'Poetry, Prose, Drama' },
      { name: 'CRK/IRK', code: 'CRK', description: 'Christian/Islamic Religious Knowledge' },
    ]

    const subjects = []
    for (const subjectInfo of subjectData) {
      try {
        const subject = await prisma.subject.upsert({
          where: { name: subjectInfo.name },
          update: {},
          create: subjectInfo,
        })
        subjects.push(subject)
        console.log(`✅ Subject created/found: ${subject.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          const existing = await prisma.subject.findUnique({ where: { name: subjectInfo.name } })
          if (existing) {
            subjects.push(existing)
            console.log(`✅ Subject already exists: ${existing.name}`)
          }
        } else {
          throw error
        }
      }
    }
    console.log()

    // ==========================================
    // CREATE TOPICS FOR SUBJECTS
    // ==========================================
    console.log('📖 Creating topics for subjects...')

    const topicTemplates: Record<string, string[]> = {
      'Mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'],
      'English Language': ['Grammar', 'Vocabulary', 'Comprehension', 'Essay Writing', 'Phonetics'],
      'Physics': ['Mechanics', 'Electricity', 'Waves', 'Modern Physics', 'Thermodynamics'],
      'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry'],
      'Biology': ['Botany', 'Zoology', 'Ecology', 'Genetics', 'Cell Biology'],
      'Economics': ['Microeconomics', 'Macroeconomics', 'International Trade', 'Development Economics'],
      'Government': ['Political Systems', 'Governance', 'Constitutional Law', 'International Relations'],
      'Commerce': ['Accounting', 'Business Management', 'Marketing', 'Finance'],
      'Literature in English': ['Poetry', 'Prose', 'Drama', 'Literary Criticism'],
      'CRK/IRK': ['Bible Studies', 'Islamic Studies', 'Moral Values', 'Religious Ethics'],
    }

    for (const subject of subjects) {
      const topics = topicTemplates[subject.name] || []
      for (const topicName of topics) {
        try {
          const existing = await prisma.topic.findFirst({ where: { name: topicName, subjectId: subject.id } })
          if (!existing) {
            await prisma.topic.create({ data: { name: topicName, subjectId: subject.id, isActive: true } })
          }
        } catch (error: any) {
          if (error.code !== 'P2002') {
            console.warn(`⚠️  Could not create topic ${topicName}: ${error.message}`)
          }
        }
      }
      console.log(`✅ Topics created for: ${subject.name}`)
    }
    console.log()

    // ==========================================
    // CREATE DEFAULT TRIAL LICENSE
    // ==========================================
    console.log('🔐 Creating default TRIAL license...')

    const licenseKey = 'UTME-TRIAL-' + randomUUID().substring(0, 8).toUpperCase()
    const license = await prisma.license.upsert({
      where: { licenseKey },
      update: {},
      create: {
        licenseKey,
        tier: 'TRIAL',
        status: 'ACTIVE',
        organizationName: 'Test School',
        contactEmail: 'admin@utmemaster.com',
        maxStudents: 50,
        maxQuestions: 500,
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActivated: false,
        features: {
          whiteLabel: false,
          exportReports: true,
          advancedAnalytics: false,
          bulkImport: false,
          apiAccess: false,
          multipleAdmins: false,
        },
      },
    })
    console.log(`✅ License created: ${license.licenseKey}\n`)

    // ==========================================
    // CREATE SAMPLE QUESTIONS (Optional)
    // ==========================================
    if (process.env.SEED_QUESTIONS === 'true') {
      console.log('❓ Creating sample questions...')
      for (const subject of subjects) {
        for (let i = 1; i <= 5; i++) {
          try {
            await prisma.question.create({
              data: {
                questionText: `Sample ${subject.name} Question ${i}`,
                questionType: 'MCQ',
                options: { A: { text: 'Option A' }, B: { text: 'Option B' }, C: { text: 'Option C' }, D: { text: 'Option D' } },
                correctAnswer: 'A',
                explanation: 'This is the correct answer because...',
                difficulty: i <= 2 ? 'EASY' : i <= 4 ? 'MEDIUM' : 'HARD',
                examType: 'JAMB',
                subjectId: subject.id,
                createdBy: admin.id,
                isActive: true,
              },
            })
          } catch (error: any) {
            if (error.code !== 'P2002') console.warn(`⚠️  Could not create question: ${error.message}`)
          }
        }
        console.log(`✅ Sample questions created for: ${subject.name}`)
      }
      console.log()
    } else {
      console.log('⏭️  Questions: Skipped (set SEED_QUESTIONS=true to create)\n')
    }

    // ==========================================
    // CREATE SAMPLE EXAMS
    // ==========================================
    console.log('📝 Creating sample exams...')

    const examData = [
      { title: 'JAMB Mock Exam 2024', description: 'Full JAMB mock examination with all subjects', duration: 180, totalMarks: 400, passMarks: 200, subjectIds: subjects.map(s => s.id) as any },
      { title: 'Mathematics Practice Exam', description: 'Practice exam focusing on Mathematics', duration: 60, totalMarks: 100, passMarks: 50, subjectIds: [subjects.find(s => s.code === 'MTH')?.id].filter(Boolean) as any },
      { title: 'English Language Practice Exam', description: 'Practice exam focusing on English Language', duration: 60, totalMarks: 100, passMarks: 50, subjectIds: [subjects.find(s => s.code === 'ENG')?.id].filter(Boolean) as any },
      { title: 'Science Subjects Exam', description: 'Combined exam for Physics, Chemistry, and Biology', duration: 120, totalMarks: 300, passMarks: 150, subjectIds: [subjects.find(s => s.code === 'PHY')?.id, subjects.find(s => s.code === 'CHM')?.id, subjects.find(s => s.code === 'BIO')?.id].filter(Boolean) as any },
    ]

    const exams = []
    for (const examInfo of examData) {
      try {
        const exam = await prisma.exam.create({
          data: {
            title: examInfo.title,
            description: examInfo.description,
            duration: examInfo.duration,
            totalMarks: examInfo.totalMarks,
            passMarks: examInfo.passMarks,
            totalQuestions: 40,
            isPublished: true,
            allowReview: true,
            allowRetake: true,
            createdBy: admin.id,
            subjectIds: examInfo.subjectIds,
            isActive: true,
          },
        })
        exams.push(exam)
        console.log(`✅ Exam created: ${exam.title}`)
      } catch (error: any) {
        console.warn(`⚠️  Could not create exam: ${error.message}`)
      }
    }
    console.log()

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('═'.repeat(60))
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!')
    console.log('═'.repeat(60))
    console.log()
    console.log('👤 Login Credentials (DEVELOPMENT ONLY):')
    console.log(`   Super Admin  → ${superAdminEmail} / ${superAdminPassword}`)
    console.log(`   Admin        → admin@utmemaster.com / Admin@123`)
    console.log(`   Students     → student1-3@test.com / Student@123`)
    console.log()
    console.log(`🔐 License Key: ${license.licenseKey} (expires ${license.trialEndDate?.toLocaleDateString()})`)
    console.log(`📊 Created: ${subjects.length} subjects, ${exams.length} exams, ${students.length} students`)
    console.log()

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
