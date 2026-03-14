// ==========================================
// SIMPLE DATABASE SEED SCRIPT
// ==========================================
// Creates:
// 1. Admin account
// 2. Student accounts
// 3. 10 subjects
// 4. 100 sample questions (10 per subject)
//
// Run with: npx prisma db seed
// Or: npx ts-node prisma/seed-simple.ts

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// ==========================================
// MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('🌱 Starting database seed...\n')

  try {
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
        // If subject already exists, fetch it
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
    // CREATE QUESTIONS
    // ==========================================
    console.log('❓ Skipping question creation (use admin dashboard to create questions)')
    console.log()

    const totalQuestions = 0

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('═'.repeat(50))
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!')
    console.log('═'.repeat(50))
    console.log()
    console.log('📊 Summary:')
    console.log(`   ✅ 1 admin account created`)
    console.log(`   ✅ ${students.length} student accounts created`)
    console.log(`   ✅ ${subjects.length} subjects created`)
    console.log(`   ⏭️  Questions: Create via admin dashboard`)
    console.log()
    
    console.log('👤 Login Credentials:')
    console.log()
    console.log('   Admin:')
    console.log('   Email: admin@utmemaster.com')
    console.log('   Password: Admin@123')
    console.log()
    console.log('   Students:')
    for (let i = 1; i <= 3; i++) {
      console.log(`   Email: student${i}@test.com`)
      console.log(`   Password: Student@123`)
    }
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
}

// ==========================================
// RUN SEED
// ==========================================
main()
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
