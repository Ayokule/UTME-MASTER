# Super Admin Account Setup - UTME Master

## OVERVIEW

A **Super Admin** account that can:
- ✅ Create/edit/delete other admins
- ✅ Create/edit/delete teachers
- ✅ Create/edit/delete students
- ✅ Manage licenses for all users
- ✅ View analytics across all accounts
- ✅ Reset passwords for other users
- ✅ Suspend/activate accounts
- ✅ Assign roles and permissions

---

## PART 1: DATABASE SCHEMA UPDATES

### Step 1: Check User Table Structure

In pgAdmin 4, run:
```sql
\d "User"
```

Current structure should have:
```
id              | uuid primary key
email           | varchar unique
password        | varchar
firstName       | varchar
lastName        | varchar
role            | enum (STUDENT, TEACHER, ADMIN)
licenseTier     | varchar
isActive        | boolean
createdAt       | timestamp
updatedAt       | timestamp
```

---

### Step 2: Add Super Admin Tracking Fields (Optional but Recommended)

```sql
-- Add columns to track super admin actions
ALTER TABLE "User" ADD COLUMN "isSuperAdmin" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN "managedBy" UUID REFERENCES "User"(id) ON DELETE SET NULL;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "loginAttempts" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP;

-- Add audit log table
CREATE TABLE "AuditLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "superAdminId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL,
  "targetUserId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "targetType" VARCHAR,
  details JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_super_admin ON "AuditLog"("superAdminId");
CREATE INDEX idx_audit_target_user ON "AuditLog"("targetUserId");
```

If schema changes error: Skip and continue - we'll work with existing schema.

---

## PART 2: CREATE SUPER ADMIN ACCOUNT IN pgAdmin 4

### Step 1: Generate Password Hash

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SuperAdmin@123', 10, (err, hash) => { if(err) console.error(err); else console.log(hash); })"
```

Example output:
```
$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP
```

---

### Step 2: Insert Super Admin User

In pgAdmin 4 Query Tool:

```sql
INSERT INTO "User" (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "licenseTier",
  "isActive",
  "isSuperAdmin",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'superadmin@utmemaster.com',
  '$2a$10$YOUR_BCRYPT_HASH_HERE',  -- Replace with your hash from step 1
  'Master',
  'Admin',
  'ADMIN',                          -- Role is still ADMIN (we use isSuperAdmin flag)
  'ENTERPRISE',
  true,
  true,                             -- This is the Super Admin
  NOW(),
  NOW()
);
```

---

### Step 3: Create Regular Admin Accounts

These admins are managed by Super Admin:

```sql
-- Admin 1 (School A)
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'admin1@schoola.com', '$2a$10$HASH_HERE', 'Admin', 'One', 'ADMIN', 'PREMIUM', true, NOW(), NOW());

-- Admin 2 (School B)
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'admin2@schoolb.com', '$2a$10$HASH_HERE', 'Admin', 'Two', 'ADMIN', 'BASIC', true, NOW(), NOW());
```

---

### Step 4: Create Teacher Accounts

```sql
-- Teacher 1
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'teacher1@schoola.com', '$2a$10$HASH_HERE', 'John', 'Teacher', 'TEACHER', 'BASIC', true, NOW(), NOW());

-- Teacher 2
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'teacher2@schoola.com', '$2a$10$HASH_HERE', 'Jane', 'Teacher', 'TEACHER', 'BASIC', true, NOW(), NOW());
```

---

### Step 5: Create Student Accounts

```sql
-- Student 1
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'student1@schoola.com', '$2a$10$HASH_HERE', 'John', 'Student', 'STUDENT', 'TRIAL', true, NOW(), NOW());

-- Student 2
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "licenseTier", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'student2@schoola.com', '$2a$10$HASH_HERE', 'Mary', 'Student', 'STUDENT', 'TRIAL', true, NOW(), NOW());
```

---

### Step 6: Verify Hierarchy

```sql
SELECT 
  id,
  email,
  role,
  "licenseTier",
  "isSuperAdmin",
  "isActive"
FROM "User"
ORDER BY "isSuperAdmin" DESC, role, email;
```

Expected output:
```
id                                    | email                     | role    | licenseTier | isSuperAdmin | isActive
--------------------------------------|---------------------------|---------|-------------|--------------|----------
550e8400-e29b-41d4-a716-446655440000 | superadmin@utmemaster.com | ADMIN   | ENTERPRISE  | true         | true
550e8400-e29b-41d4-a716-446655440001 | admin1@schoola.com        | ADMIN   | PREMIUM     | false        | true
550e8400-e29b-41d4-a716-446655440002 | admin2@schoolb.com        | ADMIN   | BASIC       | false        | true
550e8400-e29b-41d4-a716-446655440003 | teacher1@schoola.com      | TEACHER | BASIC       | false        | true
550e8400-e29b-41d4-a716-446655440004 | student1@schoola.com      | STUDENT | TRIAL       | false        | true
```

---

## PART 3: BACKEND IMPLEMENTATION - Add Super Admin Routes

### File: `src/routes/admin.routes.ts`

Add these endpoints:

```typescript
// ==========================================
// SUPER ADMIN ROUTES
// ==========================================
// Only accessible to super admin

import { Router } from 'express'
import { authenticate, authorizeSuperAdmin } from '../middleware/auth.middleware'
import * as adminController from '../controllers/admin.controller'

const router = Router()

// Protect all routes with super admin middleware
router.use(authenticate)
router.use(authorizeSuperAdmin)  // ← New middleware (see below)

// ==========================================
// USER MANAGEMENT
// ==========================================

// GET all users
router.get('/users', adminController.getAllUsers)

// GET single user
router.get('/users/:userId', adminController.getUser)

// CREATE new user (admin, teacher, or student)
router.post('/users', adminController.createUser)

// UPDATE user details
router.put('/users/:userId', adminController.updateUser)

// DELETE user (soft delete)
router.delete('/users/:userId', adminController.deleteUser)

// RESET user password
router.post('/users/:userId/reset-password', adminController.resetPassword)

// CHANGE user role
router.put('/users/:userId/role', adminController.changeUserRole)

// LOCK/UNLOCK user account
router.put('/users/:userId/lock', adminController.lockUser)
router.put('/users/:userId/unlock', adminController.unlockUser)

// SUSPEND/ACTIVATE user
router.put('/users/:userId/suspend', adminController.suspendUser)
router.put('/users/:userId/activate', adminController.activateUser)

// ==========================================
// ADMIN MANAGEMENT
// ==========================================

// GET all admins
router.get('/admins', adminController.getAllAdmins)

// ASSIGN admin to manage school/district
router.post('/admins/:adminId/assign-school', adminController.assignAdminToSchool)

// AUDIT LOG
router.get('/audit-logs', adminController.getAuditLogs)
router.get('/audit-logs/:userId', adminController.getUserAuditLog)

export default router
```

---

### File: `src/middleware/auth.middleware.ts`

Add super admin authorization:

```typescript
/**
 * Authorize Super Admin
 * Only users with isSuperAdmin = true can access
 */
export async function authorizeSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user
  
  // Check if user is super admin
  const superAdminUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isSuperAdmin: true }
  })
  
  if (!superAdminUser?.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This action requires super admin privileges'
      }
    })
  }
  
  next()
}
```

---

### File: `src/controllers/admin.controller.ts`

Add super admin functions:

```typescript
import { prisma } from '../config/database'
import { asyncHandler } from '../middleware/error.middleware'
import * as bcrypt from 'bcryptjs'

// ==========================================
// GET ALL USERS
// ==========================================
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query
  const superAdminId = (req as any).user.id
  
  const where: any = {}
  
  if (role) where.role = role
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false
  
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      licenseTier: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  res.json({
    success: true,
    data: { users, total: users.length }
  })
})

// ==========================================
// CREATE USER
// ==========================================
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, licenseTier } = req.body
  const superAdminId = (req as any).user.id
  
  // Validate role
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid role' }
    })
  }
  
  // Check email doesn't exist
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email already exists' }
    })
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      licenseTier,
      isActive: true
    }
  })
  
  // Log audit
  await logAudit(superAdminId, 'USER_CREATED', user.id, 'User', {
    email,
    role,
    licenseTier
  })
  
  res.status(201).json({
    success: true,
    data: { user }
  })
})

// ==========================================
// UPDATE USER
// ==========================================
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { firstName, lastName, licenseTier } = req.body
  const superAdminId = (req as any).user.id
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      licenseTier
    }
  })
  
  await logAudit(superAdminId, 'USER_UPDATED', userId, 'User', { firstName, lastName, licenseTier })
  
  res.json({ success: true, data: { user } })
})

// ==========================================
// DELETE USER (Soft Delete)
// ==========================================
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const superAdminId = (req as any).user.id
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  })
  
  await logAudit(superAdminId, 'USER_DELETED', userId, 'User', {})
  
  res.json({ success: true, message: 'User deleted' })
})

// ==========================================
// RESET PASSWORD
// ==========================================
export const resetPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { newPassword } = req.body
  const superAdminId = (req as any).user.id
  
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
  
  await logAudit(superAdminId, 'PASSWORD_RESET', userId, 'User', {})
  
  res.json({ success: true, message: 'Password reset successfully' })
})

// ==========================================
// CHANGE USER ROLE
// ==========================================
export const changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { newRole } = req.body
  const superAdminId = (req as any).user.id
  
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(newRole)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid role' }
    })
  }
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })
  
  await logAudit(superAdminId, 'ROLE_CHANGED', userId, 'User', { newRole })
  
  res.json({ success: true, data: { user } })
})

// ==========================================
// LOCK USER ACCOUNT
// ==========================================
export const lockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { reason } = req.body
  const superAdminId = (req as any).user.id
  
  const lockedUntil = new Date()
  lockedUntil.setHours(lockedUntil.getHours() + 24)
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { lockedUntil, loginAttempts: 0 }
  })
  
  await logAudit(superAdminId, 'ACCOUNT_LOCKED', userId, 'User', { reason })
  
  res.json({ success: true, message: 'Account locked for 24 hours' })
})

// ==========================================
// UNLOCK USER ACCOUNT
// ==========================================
export const unlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const superAdminId = (req as any).user.id
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { 
      lockedUntil: null,
      loginAttempts: 0
    }
  })
  
  await logAudit(superAdminId, 'ACCOUNT_UNLOCKED', userId, 'User', {})
  
  res.json({ success: true, message: 'Account unlocked' })
})

// ==========================================
// SUSPEND USER
// ==========================================
export const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const superAdminId = (req as any).user.id
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  })
  
  await logAudit(superAdminId, 'USER_SUSPENDED', userId, 'User', {})
  
  res.json({ success: true, message: 'User suspended' })
})

// ==========================================
// ACTIVATE USER
// ==========================================
export const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const superAdminId = (req as any).user.id
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true }
  })
  
  await logAudit(superAdminId, 'USER_ACTIVATED', userId, 'User', {})
  
  res.json({ success: true, message: 'User activated' })
})

// ==========================================
// AUDIT LOG
// ==========================================
async function logAudit(
  superAdminId: string,
  action: string,
  targetUserId: string | null,
  targetType: string,
  details: any
) {
  // Only if AuditLog table exists
  try {
    await prisma.auditLog.create({
      data: {
        superAdminId,
        action,
        targetUserId,
        targetType,
        details
      }
    })
  } catch (error) {
    // AuditLog table may not exist, skip
    console.warn('Audit log failed:', error)
  }
}

export const getAuditLogs = asyncHandler(async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        superAdmin: { select: { firstName: true, email: true } },
        targetUser: { select: { firstName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    res.json({ success: true, data: { logs } })
  } catch (error) {
    res.json({ success: true, data: { logs: [], message: 'Audit logs not available' } })
  }
})

export const getUserAuditLog = asyncHandler(async (req, res) => {
  const { userId } = req.params
  
  try {
    const logs = await prisma.auditLog.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    res.json({ success: true, data: { logs } })
  } catch (error) {
    res.json({ success: true, data: { logs: [] } })
  }
})

export const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      licenseTier: true,
      isActive: true,
      isSuperAdmin: true,
      createdAt: true
    }
  })
  
  res.json({ success: true, data: { admins } })
})

export const assignAdminToSchool = asyncHandler(async (req, res) => {
  const { adminId } = req.params
  const { schoolName, schoolCode } = req.body
  const superAdminId = (req as any).user.id
  
  // Update admin's profile with school info
  const admin = await prisma.user.update({
    where: { id: adminId },
    data: {
      // Store school info in metadata or create separate School model
      firstName: `${req.body.firstName || 'Admin'} - ${schoolName}`
    }
  })
  
  await logAudit(superAdminId, 'ADMIN_ASSIGNED', adminId, 'Admin', { schoolName, schoolCode })
  
  res.json({ success: true, data: { admin } })
})
```

---

## PART 4: FRONTEND - SUPER ADMIN DASHBOARD

### File: `src/pages/superadmin/Dashboard.tsx`

```typescript
import { useState, useEffect } from 'react'
import { Plus, Users, Lock, Trash2, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Layout from '../../components/Layout'

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // GET /api/admin/users
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setUsers(data.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    // Prompt for user details
    const email = prompt('Email:')
    if (!email) return

    const password = prompt('Password:')
    const firstName = prompt('First Name:')
    const lastName = prompt('Last Name:')
    const role = prompt('Role (STUDENT/TEACHER/ADMIN):')

    try {
      // POST /api/admin/users
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, firstName, lastName, role, licenseTier: 'TRIAL' })
      })

      if (response.ok) {
        alert('User created successfully')
        fetchUsers()
      } else {
        alert('Failed to create user')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password:')
    if (!newPassword) return

    try {
      // POST /api/admin/users/:userId/reset-password
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        alert('Password reset successfully')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const suspendUser = async (userId: string) => {
    if (!confirm('Suspend this user?')) return

    try {
      // PUT /api/admin/users/:userId/suspend
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (response.ok) {
        alert('User suspended')
        fetchUsers()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <Button onClick={createUser} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create User
          </Button>
        </div>

        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.firstName} {user.lastName}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => resetPassword(user.id)}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => suspendUser(user.id)}>
                      <Lock className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Layout>
  )
}
```

---

## PART 5: TEST SUPER ADMIN LOGIN

### Step 1: Restart Backend
```bash
npm run dev
```

### Step 2: Go to Frontend
```
http://localhost:5173/login
```

### Step 3: Login with Super Admin
```
Email: superadmin@utmemaster.com
Password: SuperAdmin@123
```

### Step 4: Navigate to Super Admin Dashboard
```
http://localhost:5173/superadmin/dashboard
```

---

## PART 6: USER HIERARCHY & PERMISSIONS

```
┌─────────────────────────────────┐
│      SUPER ADMIN (Master)       │  ← Can manage ALL users
│  superadmin@utmemaster.com      │
│  isSuperAdmin = true            │
│  role = ADMIN                   │
└────────────────┬────────────────┘
                 │
        ┌────────┴────────┬────────────┐
        │                 │            │
        ▼                 ▼            ▼
    ┌───────────┐   ┌───────────┐  ┌──────────┐
    │  Admin 1  │   │  Admin 2  │  │ Teachers │
    │ School A  │   │ School B  │  │  (Many)  │
    │(PREMIUM)  │   │ (BASIC)   │  └──────────┘
    └─────┬─────┘   └─────┬─────┘         │
          │               │               │
          └───────────────┴───────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    ┌─────────┐          ┌──────────┐
    │Students │          │ Teachers │
    │ (Many)  │          │ (Many)   │
    └─────────┘          └──────────┘
```

### Permissions Matrix:

| Action | Super Admin | Admin | Teacher | Student |
|--------|:-----------:|:-----:|:-------:|:-------:|
| Create User | ✅ | ❌ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ |
| Reset Password | ✅ | ❌ | ❌ | ❌ |
| View All Users | ✅ | Partial* | ❌ | ❌ |
| Create Exam | ❌ | ✅ | ✅ | ❌ |
| Create Questions | ❌ | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Take Exam | ❌ | ❌ | ❌ | ✅ |

*Admin can view users in their school only

---

## PART 7: QUICK REFERENCE - SQL QUERIES

### Count Users by Role
```sql
SELECT role, COUNT(*) as count FROM "User" GROUP BY role;
```

### Find Super Admin
```sql
SELECT email, "firstName", "isSuperAdmin" FROM "User" WHERE "isSuperAdmin" = true;
```

### Deactivate All Users (Except Super Admin)
```sql
UPDATE "User" SET "isActive" = false WHERE "isSuperAdmin" = false;
```

### Get Recent User Activity
```sql
SELECT email, "lastLoginAt" FROM "User" ORDER BY "lastLoginAt" DESC LIMIT 10;
```

### Unlock Locked Accounts
```sql
UPDATE "User" SET "lockedUntil" = NULL WHERE "lockedUntil" < NOW();
```

---

## TROUBLESHOOTING

### Super Admin Can't Access User Management Routes
**Check**:
1. User has `isSuperAdmin = true` in database
2. Token is valid (check backend logs)
3. `authorizeSuperAdmin` middleware is applied
4. Route exists in `admin.routes.ts`

**Fix**:
```sql
UPDATE "User" SET "isSuperAdmin" = true WHERE email = 'superadmin@utmemaster.com';
```

### Can't Create Users via UI
**Ensure**:
1. Super admin is logged in
2. Backend has `/api/admin/users` POST endpoint
3. API returns proper error messages
4. Frontend catches errors and shows toast

---

## NEXT STEPS

1. ✅ Create Super Admin account in database
2. ✅ Create regular Admin/Teacher accounts
3. ✅ Implement backend routes for user management
4. ✅ Build Super Admin dashboard UI
5. ✅ Test creating/editing/deleting users
6. ✅ Set up audit logging
7. Test all permissions matrix items

