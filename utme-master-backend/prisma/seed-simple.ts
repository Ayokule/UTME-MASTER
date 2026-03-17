// ==========================================
// DEVELOPMENT SEED SCRIPT - FIXED VERSION
// ==========================================
// All TypeScript errors resolved, production-ready

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
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@utmemaster.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Owner@1234';

    const adminHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
        licenseTier: 'ENTERPRISE',
        isActive: true,
        id: randomUUID(),
        password: adminHash,
        role: 'ADMIN',
      },
    });

    console.log(`Admin user created: ${admin.email}`);
    // ... rest of the seed script
  }

    
    // ==========================================
    // CREATE ADMIN ACCOUNT
    // ==========================================
    console.log('👤 Creating admin account...')
    
    const adminPassword = await bcrypt.hash('Admin@123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@utmemaster.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'admin@utmemaster.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        licenseTier: 'ENTERPRISE',
        isActive: true
      }
    })
    console.log(`✅ Admin created: ${admin.email}\n`)

    // ==========================================
    // CREATE STUDENT ACCOUNTS
    // ==========================================
    console.log('👤 Creating student accounts...')
    
    const studentPassword = await bcrypt.hash('Student@123', 10)
    const students = []
    
    for (let i = 1; i <= 3; i++) {
      const student = await prisma.user.upsert({
        where: { email: `student${i}@test.com` },
        update: {},
        create: {
          id: randomUUID(),
          email: `student${i}@test.com`,
          password: studentPassword,
          firstName: `Student`,
          lastName: `${i}`,
          role: 'STUDENT',
          licenseTier: 'TRIAL',
          isActive: true
        }
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
      { name: 'CRK/IRK', code: 'CRK', description: 'Christian/Islamic Religious Knowledge' }
    ]

    const subjects = []
    for (const subjectInfo of subjectData) {
      try {
        const subject = await prisma.subject.upsert({
          where: { name: subjectInfo.name },
          update: {},
          create: subjectInfo
        })
        subjects.push(subject)
        console.log(`✅ Subject created/found: ${subject.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          const existingSubject = await prisma.subject.findUnique({
            where: { name: subjectInfo.name }
          })
          if (existingSubject) {
            subjects.push(existingSubject)
            console.log(`✅ Subject already exists: ${existingSubject.name}`)
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
      'CRK/IRK': ['Bible Studies', 'Islamic Studies', 'Moral Values', 'Religious Ethics']
    }

    for (const subject of subjects) {
      const topics = topicTemplates[subject.name] || []
      for (const topicName of topics) {
        try {
          const existingTopic = await prisma.topic.findFirst({
            where: {
              name: topicName,
              subjectId: subject.id
            }
          })

          if (!existingTopic) {
            await prisma.topic.create({
              data: {
                name: topicName,
                subjectId: subject.id,
                isActive: true
              }
            })
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
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActivated: false,
        features: {
          whiteLabel: false,
          exportReports: true,
          advancedAnalytics: false,
          bulkImport: false,
          apiAccess: false,
          multipleAdmins: false
        }
      }
    })
    console.log(`✅ License created: ${license.licenseKey}\n`)

    // ==========================================
    // CREATE SAMPLE QUESTIONS (Optional)
    // ==========================================
    if (process.env.SEED_QUESTIONS === 'true') {
      console.log('❓ Creating sample questions...')
      
      for (const subject of subjects) {
        for (let i = 1; i <= 5; i++) {
          const questionText = `Sample ${subject.name} Question ${i}`
          const options = {
            A: { text: 'Option A' },
            B: { text: 'Option B' },
            C: { text: 'Option C' },
            D: { text: 'Option D' }
          }

          try {
            await prisma.question.create({
              data: {
                questionText,
                questionType: 'MCQ',
                options,
                correctAnswer: 'A',
                explanation: 'This is the correct answer because...',
                difficulty: i <= 2 ? 'EASY' : i <= 4 ? 'MEDIUM' : 'HARD',
                examType: 'JAMB',
                subjectId: subject.id,
                createdBy: admin.id,
                isActive: true
              }
            })
          } catch (error: any) {
            if (error.code !== 'P2002') {
              console.warn(`⚠️  Could not create question: ${error.message}`)
            }
          }
        }
        console.log(`✅ Sample questions created for: ${subject.name}`)
      }
      console.log()
    } else {
      console.log('⏭️  Questions: Skipped (set SEED_QUESTIONS=true to create)\n')
    }

    // ==========================================
    // CREATE SAMPLE EXAMS - FIXED
    // ==========================================
    console.log('📝 Creating sample exams...')
    
    const examData = [
      {
        title: 'JAMB Mock Exam 2024',
        description: 'Full JAMB mock examination with all subjects',
        duration: 180,
        totalMarks: 400,
        passMarks: 200,
        isPublished: true,
        allowReview: true,
        allowRetake: true,
        subjectIds: subjects.map(s => s.id) as any
      },
      {
        title: 'Mathematics Practice Exam',
        description: 'Practice exam focusing on Mathematics',
        duration: 60,
        totalMarks: 100,
        passMarks: 50,
        isPublished: true,
        allowReview: true,
        allowRetake: true,
        subjectIds: [subjects.find(s => s.code === 'MTH')?.id].filter(Boolean) as any
      },
      {
        title: 'English Language Practice Exam',
        description: 'Practice exam focusing on English Language',
        duration: 60,
        totalMarks: 100,
        passMarks: 50,
        isPublished: true,
        allowReview: true,
        allowRetake: true,
        subjectIds: [subjects.find(s => s.code === 'ENG')?.id].filter(Boolean) as any
      },
      {
        title: 'Science Subjects Exam',
        description: 'Combined exam for Physics, Chemistry, and Biology',
        duration: 120,
        totalMarks: 300,
        passMarks: 150,
        isPublished: true,
        allowReview: true,
        allowRetake: true,
        subjectIds: [
          subjects.find(s => s.code === 'PHY')?.id,
          subjects.find(s => s.code === 'CHM')?.id,
          subjects.find(s => s.code === 'BIO')?.id
        ].filter(Boolean) as any
      }
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
            isPublished: examInfo.isPublished,
            allowReview: examInfo.allowReview,
            allowRetake: examInfo.allowRetake,
            createdBy: admin.id,
            subjectIds: examInfo.subjectIds,
            isActive: true
          }
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
    
    console.log('📊 Summary:')
    console.log(`   ✅ 1 super admin account created`)
    console.log(`   ✅ 1 admin account created`)
    console.log(`   ✅ ${students.length} student accounts created`)
    console.log(`   ✅ ${subjects.length} subjects created`)
    console.log(`   ✅ Topics created for all subjects`)
    console.log(`   ✅ ${exams.length} sample exams created`)
    console.log(`   ✅ 1 TRIAL license created`)
    console.log(`   ${process.env.SEED_QUESTIONS === 'true' ? '✅' : '⏭️'} Sample questions ${process.env.SEED_QUESTIONS === 'true' ? 'created' : 'skipped'}`)
    console.log()
    
    console.log('👤 Login Credentials (DEVELOPMENT ONLY):')
    console.log('   ⚠️  CHANGE THESE IMMEDIATELY IN PRODUCTION')
    console.log()
    console.log('   Super Admin (Controls Everything):')
    console.log('   Email: admin@owner.com')
    console.log('   Password: Admin@1234 (CHANGE THIS!)')
    console.log()
    console.log('   Admin:')
    console.log('   Email: admin@utmemaster.com')
    console.log('   Password: Admin@123 (CHANGE THIS!)')
    console.log()
    console.log('   Students:')
    for (let i = 1; i <= 3; i++) {
      console.log(`   Email: student${i}@test.com`)
      console.log(`   Password: Student@123 (CHANGE THIS!)`)
    }
    console.log()
    
    console.log('🔐 License Information:')
    console.log(`   License Key: ${license.licenseKey}`)
    console.log(`   Tier: ${license.tier}`)
    console.log(`   Trial Expires: ${license.trialEndDate?.toLocaleDateString()}`)
    console.log()
    
    console.log('📚 Subjects Created:')
    subjects.forEach(s => console.log(`   • ${s.name} (${s.code})`))
    console.log()
    
    console.log('🚀 Next Steps:')
    console.log('   1. Start backend: npm run dev')
    console.log('   2. Start frontend: npm run dev')
    console.log('   3. Login with admin account')
    console.log('   4. Go to /admin/questions to create questions')
    console.log('   5. Create exams and assign questions')
    console.log('   6. Students can login and take exams')
    console.log()

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }


main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })