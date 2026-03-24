# UTME Master Admin Guide

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [User Management](#user-management)
3. [Exam Management](#exam-management)
4. [Question Management](#question-management)
5. [Analytics and Reporting](#analytics-and-reporting)
6. [System Settings](#system-settings)
7. [Best Practices](#best-practices)

---

## Admin Dashboard Overview

### Accessing Admin Panel

1. Log in with admin credentials
2. Navigate to `/admin/dashboard`
3. View admin dashboard with key metrics

### Dashboard Widgets

- **Total Users** - Count of all registered users
- **Active Exams** - Number of published exams
- **Total Questions** - Questions in bank
- **Today's Activity** - Recent user activity
- **System Status** - Platform health

---

## User Management

### Viewing Users

1. Navigate to "User Management"
2. View all users in table format
3. Filter by:
   - Role (Student, Teacher, Admin)
   - License Tier
   - Activity Status
   - Registration Date

### User Actions

#### View User Details

1. Click on user row
2. View:
   - Profile information
   - Exam history
   - Progress statistics
   - Account status

#### Edit User

1. Click "Edit" button
2. Update:
   - First Name
   - Last Name
   - Email
   - Role
   - License Tier
3. Click "Save"

#### Deactivate User

1. Click "Deactivate" button
2. Confirm action
3. User can no longer log in

#### Reset Password

1. Click "Reset Password" button
2. User receives reset email
3. User sets new password

### Bulk User Actions

- **Export Users** - Download CSV
- **Bulk Deactivate** - Deactivate multiple users
- **Bulk License Update** - Update license tiers

---

## Exam Management

### Creating Exams

1. Navigate to "Exam Management"
2. Click "Create Exam"
3. Fill in form:

#### Basic Information
- **Title** - Exam name
- **Description** - Exam details
- **Duration** - Time in minutes
- **Total Marks** - Maximum score
- **Pass Marks** - Minimum passing score

#### Configuration
- **Subjects** - Select subjects
- **Questions Per Subject** - Number of questions per subject
- **Randomize Questions** - Shuffle question order
- **Randomize Options** - Shuffle answer options
- **Show Results** - Display results immediately
- **Allow Review** - Allow answer review
- **Allow Retake** - Allow retakes

#### Scheduling (Optional)
- **Starts At** - Exam availability start time
- **Ends At** - Exam availability end time

4. Click "Save"

### Publishing Exams

1. Find exam in list
2. Click "Edit"
3. Toggle "Published" switch
4. Click "Save"

### Editing Exams

1. Find exam in list
2. Click "Edit"
3. Update fields as needed
4. Click "Save"

### Deleting Exams

1. Find exam in list
2. Click "Delete"
3. Confirm deletion

### Exam Statistics

1. Click "View Statistics" on exam
2. View:
   - Total Attempts
   - Pass Rate
   - Average Score
   - Highest/Lowest Score
   - Grade Distribution
   - Recent Attempts

---

## Question Management

### Creating Questions

1. Navigate to "Question Management"
2. Click "Create Question"
3. Fill in form:

#### Question Details
- **Question Text** - Main question
- **Question Type** - MCQ, True/False, Fill Blank, Essay
- **Options** - Answer choices
- **Correct Answer** - Select correct option
- **Explanation** - Detailed explanation
- **Difficulty** - EASY, MEDIUM, HARD
- **Year** - Exam year
- **Exam Type** - JAMB, WAEC, NECO, MOCK, PRACTICE
- **Subject** - Select subject
- **Topic** - Select topic (optional)

4. Click "Save"

### Importing Questions

1. Navigate to "Question Management"
2. Click "Import Questions"
3. Upload CSV file with format:
```
question_text,question_type,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,subject
```
4. Click "Import"

### Editing Questions

1. Find question in list
2. Click "Edit"
3. Update fields
4. Click "Save"

### Deleting Questions

1. Find question in list
2. Click "Delete"
3. Confirm deletion

### Question Filters

- **Subject** - Filter by subject
- **Difficulty** - Filter by difficulty
- **Exam Type** - Filter by exam type
- **Status** - Active/Inactive

---

## Analytics and Reporting

### Student Analytics

1. Navigate to "Analytics"
2. Select student from dropdown
3. View:
   - **Exam History** - All exams taken
   - **Score Trends** - Performance over time
   - **Subject Breakdown** - Performance by subject
   - **Improvement Metrics** - Progress tracking

### Exam Analytics

1. Navigate to "Exam Management"
2. Click "View Statistics" on exam
3. View:
   - **Attempt Statistics** - Total attempts, pass rate
   - **Score Distribution** - Score breakdown
   - **Time Analysis** - Average time spent
   - **Recent Attempts** - Latest exam attempts

### Platform Analytics

1. Navigate to "Platform Analytics"
2. View:
   - **Total Users** - User count
   - **Active Users** - Recent activity
   - **Exam Statistics** - Platform-wide stats
   - **Trends** - Growth and engagement

### Exporting Reports

1. Navigate to "Reports"
2. Select report type:
   - User Report
   - Exam Report
   - Question Report
   - Performance Report
3. Set date range
4. Click "Export"
5. Download CSV/Excel file

---

## System Settings

### General Settings

1. Navigate to "System Settings"
2. Configure:
   - **Site Name** - Platform name
   - **Site Description** - Platform description
   - **Maintenance Mode** - Enable/disable maintenance
   - **Max Upload Size** - File upload limit (MB)
   - **Session Timeout** - Session duration (minutes)
   - **Timezone** - Platform timezone

### Security Settings

1. Configure:
   - **Enable Two-Factor** - 2FA requirement
   - **Password Min Length** - Minimum password length
   - **Password Expiry** - Password change frequency
   - **Max Login Attempts** - Lockout threshold
   - **Lockout Duration** - Lockout time (minutes)
   - **Enable Audit Log** - Log user actions

### Email Settings

1. Configure:
   - **Enable Notifications** - Email notifications
   - **SMTP Host** - SMTP server
   - **SMTP Port** - SMTP port
   - **SMTP Username** - SMTP username
   - **SMTP Password** - SMTP password
   - **From Email** - Sender email address

### Notification Settings

1. Configure:
   - **Email Notifications** - Enable email alerts
   - **SMS Notifications** - Enable SMS alerts
   - **Push Notifications** - Enable push alerts

---

## Best Practices

### User Management

1. **Regular Reviews**
   - Review inactive accounts monthly
   - Update user roles as needed
   - Monitor license usage

2. **Data Privacy**
   - Comply with data protection regulations
   - Secure user data
   - Regular backups

### Exam Management

1. **Quality Control**
   - Review questions before publishing
   - Test exams before release
   - Update outdated content

2. **Scheduling**
   - Plan exam schedules in advance
   - Allow sufficient preparation time
   - Communicate exam dates to students

### Question Management

1. **Content Quality**
   - Write clear, unambiguous questions
   - Provide detailed explanations
   - Cover all topics evenly

2. **Maintenance**
   - Update questions regularly
   - Remove outdated content
   - Add new questions

### Analytics

1. **Regular Monitoring**
   - Review platform analytics weekly
   - Monitor student progress
   - Identify trends

2. **Data-Driven Decisions**
   - Use analytics to improve content
   - Identify struggling students
   - Adjust teaching strategies

### Security

1. **Regular Audits**
   - Review user access monthly
   - Check system logs
   - Update passwords

2. **Backup Strategy**
   - Daily database backups
   - Weekly full backups
   - Monthly archive backups

---

## Troubleshooting

### Common Issues

#### 1. User Cannot Access Exam

**Symptoms:**
- User reports exam not visible

**Solution:**
- Check exam is published
- Verify exam scheduling
- Check user license tier

#### 2. Exam Not Showing Results

**Symptoms:**
- Results not displayed after exam

**Solution:**
- Check "Show Results" setting
- Verify exam is submitted
- Check system logs

#### 3. Import Failed

**Symptoms:**
- CSV import fails

**Solution:**
- Verify CSV format
- Check file size limits
- Review error messages

#### 4. Analytics Not Loading

**Symptoms:**
- Analytics page shows error

**Solution:**
- Check database connection
- Verify data exists
- Check system logs

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + K | Quick search |
| Ctrl + E | Create exam |
| Ctrl + Q | Create question |
| Ctrl + U | User management |
| Ctrl + A | Analytics |

---

## Support

For admin support:
- Email: admin-support@utmemaster.com
- Phone: +234-XXX-XXX-XXXX
- Documentation: docs.utmemaster.com
