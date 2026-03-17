// ==========================================
// EMAIL SERVICE
// ==========================================
// Comprehensive email service with templates and SMTP integration

import nodemailer from 'nodemailer'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'
import { BadRequestError } from '../utils/errors'
import { throwBadRequest } from '../utils/errorStandardization'

// ==========================================
// INTERFACES
// ==========================================

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  template?: string
  templateData?: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// ==========================================
// EMAIL TRANSPORTER SETUP
// ==========================================

let transporter: nodemailer.Transporter | null = null

async function createTransporter(): Promise<nodemailer.Transporter> {
  try {
    // Get SMTP settings from system settings
    const settings = await prisma.systemSettings.findFirst()
    
    if (!settings || !settings.smtpHost || !settings.smtpUsername || !settings.smtpPassword) {
      throwBadRequest('SMTP configuration not found in system settings')
    }

    const config: SMTPConfig = {
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtpUsername,
        pass: settings.smtpPassword
      }
    }

    const newTransporter = nodemailer.createTransporter(config)
    
    // Verify connection
    await newTransporter.verify()
    logger.info('Email transporter created and verified successfully')
    
    return newTransporter
  } catch (error) {
    logger.error('Failed to create email transporter:', error)
    throw new BadRequestError('Email service configuration error')
  }
}

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    transporter = await createTransporter()
  }
  return transporter
}

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const emailTemplates = {
  // Welcome email for new users
  welcome: (data: { firstName: string; lastName: string; role: string }): EmailTemplate => ({
    subject: 'Welcome to UTME Master!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to UTME Master</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to UTME Master!</h1>
            <p>Your journey to UTME success starts here</p>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName} ${data.lastName}!</h2>
            <p>Welcome to UTME Master, the comprehensive examination preparation system. Your account has been successfully created with <strong>${data.role}</strong> privileges.</p>
            
            <h3>What you can do:</h3>
            <ul>
              ${data.role === 'STUDENT' ? `
                <li>Take practice exams and mock tests</li>
                <li>Track your progress and performance</li>
                <li>Access detailed analytics and insights</li>
                <li>Review questions and explanations</li>
              ` : `
                <li>Create and manage questions</li>
                <li>Set up exams and assessments</li>
                <li>Monitor student performance</li>
                <li>Access comprehensive analytics</li>
              `}
            </ul>
            
            <p>Get started by logging into your account and exploring the platform.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to Your Account</a>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The UTME Master Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 UTME Master. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to UTME Master!

Hello ${data.firstName} ${data.lastName}!

Welcome to UTME Master, the comprehensive examination preparation system. Your account has been successfully created with ${data.role} privileges.

Get started by logging into your account at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

If you have any questions, please contact our support team.

Best regards,
The UTME Master Team`
  }),

  // Password reset email
  passwordReset: (data: { firstName: string; resetToken: string; resetUrl: string }): EmailTemplate => ({
    subject: 'Reset Your UTME Master Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Secure your UTME Master account</p>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName}!</h2>
            <p>We received a request to reset your password for your UTME Master account. If you made this request, click the button below to reset your password.</p>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Your Password</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
            
            <p>If you didn't request a password reset, please contact our support team immediately.</p>
            
            <p>Best regards,<br>The UTME Master Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 UTME Master. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request

Hello ${data.firstName}!

We received a request to reset your password for your UTME Master account.

Reset your password by visiting: ${data.resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
The UTME Master Team`
  }),

  // Exam completion notification
  examCompletion: (data: { 
    firstName: string; 
    examTitle: string; 
    score: number; 
    percentage: number; 
    totalQuestions: number;
    passed: boolean;
    resultsUrl: string;
  }): EmailTemplate => ({
    subject: `Exam Completed: ${data.examTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exam Completion</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${data.passed ? '#28a745' : '#dc3545'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .score-card { background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border: 2px solid ${data.passed ? '#28a745' : '#dc3545'}; }
          .score { font-size: 48px; font-weight: bold; color: ${data.passed ? '#28a745' : '#dc3545'}; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.passed ? '🎉 Congratulations!' : '📚 Keep Practicing!'}</h1>
            <p>Exam completed: ${data.examTitle}</p>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName}!</h2>
            <p>You have successfully completed the exam: <strong>${data.examTitle}</strong></p>
            
            <div class="score-card">
              <div class="score">${data.percentage}%</div>
              <p><strong>${data.score} out of ${data.totalQuestions}</strong> questions correct</p>
              <p style="color: ${data.passed ? '#28a745' : '#dc3545'}; font-weight: bold;">
                ${data.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </p>
            </div>
            
            ${data.passed ? `
              <p>🎊 Excellent work! You've demonstrated strong understanding of the material. Keep up the great work as you continue your UTME preparation journey.</p>
            ` : `
              <p>💪 Don't be discouraged! Every attempt is a learning opportunity. Review the questions you missed and try again when you're ready.</p>
            `}
            
            <h3>Next Steps:</h3>
            <ul>
              <li>Review your detailed results and explanations</li>
              <li>Identify areas for improvement</li>
              <li>Practice more questions in challenging topics</li>
              <li>Track your progress over time</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${data.resultsUrl}" class="button">View Detailed Results</a>
            </div>
            
            <p>Keep practicing and stay focused on your UTME goals!</p>
            
            <p>Best regards,<br>The UTME Master Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 UTME Master. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Exam Completed: ${data.examTitle}

Hello ${data.firstName}!

You have successfully completed the exam: ${data.examTitle}

Your Results:
- Score: ${data.score} out of ${data.totalQuestions}
- Percentage: ${data.percentage}%
- Status: ${data.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}

View your detailed results at: ${data.resultsUrl}

Keep practicing and stay focused on your UTME goals!

Best regards,
The UTME Master Team`
  }),

  // Exam reminder notification
  examReminder: (data: {
    firstName: string;
    examTitle: string;
    examDate: string;
    examUrl: string;
  }): EmailTemplate => ({
    subject: `Reminder: ${data.examTitle} - Tomorrow`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exam Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Exam Reminder</h1>
            <p>Don't forget your upcoming exam</p>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName}!</h2>
            <p>This is a friendly reminder that you have an exam scheduled for tomorrow.</p>
            
            <div class="reminder-box">
              <h3>📋 Exam Details:</h3>
              <p><strong>Exam:</strong> ${data.examTitle}</p>
              <p><strong>Date:</strong> ${data.examDate}</p>
            </div>
            
            <h3>📚 Preparation Tips:</h3>
            <ul>
              <li>Review your notes and practice materials</li>
              <li>Get a good night's sleep</li>
              <li>Prepare your workspace and materials</li>
              <li>Ensure stable internet connection</li>
              <li>Log in a few minutes early</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${data.examUrl}" class="button">Go to Exam</a>
            </div>
            
            <p>Good luck with your exam! We believe in your success.</p>
            
            <p>Best regards,<br>The UTME Master Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 UTME Master. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Exam Reminder

Hello ${data.firstName}!

This is a reminder that you have an exam scheduled for tomorrow:

Exam: ${data.examTitle}
Date: ${data.examDate}

Preparation tips:
- Review your notes and practice materials
- Get a good night's sleep
- Ensure stable internet connection
- Log in a few minutes early

Access your exam at: ${data.examUrl}

Good luck!

Best regards,
The UTME Master Team`
  })
}

// ==========================================
// EMAIL SENDING FUNCTIONS
// ==========================================

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const emailTransporter = await getTransporter()
    const settings = await prisma.systemSettings.findFirst()
    
    if (!settings?.enableNotifications) {
      logger.info('Email notifications are disabled in system settings')
      return false
    }

    let emailContent: { subject: string; html?: string; text?: string }

    if (options.template && options.templateData) {
      // Use template
      const template = emailTemplates[options.template as keyof typeof emailTemplates]
      if (!template) {
        throwBadRequest(`Email template '${options.template}' not found`)
      }
      
      const templateContent = template(options.templateData)
      emailContent = {
        subject: templateContent.subject,
        html: templateContent.html,
        text: templateContent.text
      }
    } else {
      // Use provided content
      emailContent = {
        subject: options.subject,
        html: options.html,
        text: options.text
      }
    }

    const mailOptions = {
      from: `"UTME Master" <${settings?.fromEmail || 'noreply@utmemaster.com'}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: options.attachments
    }

    const result = await emailTransporter.sendMail(mailOptions)
    logger.info(`Email sent successfully to ${options.to}. Message ID: ${result.messageId}`)
    
    return true
  } catch (error) {
    logger.error('Failed to send email:', error)
    return false
  }
}

// ==========================================
// SPECIFIC EMAIL FUNCTIONS
// ==========================================

export async function sendWelcomeEmail(userEmail: string, userData: {
  firstName: string;
  lastName: string;
  role: string;
}): Promise<boolean> {
  return await sendEmail({
    to: userEmail,
    template: 'welcome',
    templateData: userData
  })
}

export async function sendPasswordResetEmail(userEmail: string, userData: {
  firstName: string;
  resetToken: string;
}): Promise<boolean> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${userData.resetToken}`
  
  return await sendEmail({
    to: userEmail,
    template: 'passwordReset',
    templateData: {
      ...userData,
      resetUrl
    }
  })
}

export async function sendExamCompletionEmail(userEmail: string, examData: {
  firstName: string;
  examTitle: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  passed: boolean;
  studentExamId: string;
}): Promise<boolean> {
  const resultsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/results/${examData.studentExamId}`
  
  return await sendEmail({
    to: userEmail,
    template: 'examCompletion',
    templateData: {
      ...examData,
      resultsUrl
    }
  })
}

export async function sendExamReminderEmail(userEmail: string, reminderData: {
  firstName: string;
  examTitle: string;
  examDate: string;
  examId: string;
}): Promise<boolean> {
  const examUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/exam/${reminderData.examId}`
  
  return await sendEmail({
    to: reminderData.examTitle,
    template: 'examReminder',
    templateData: {
      ...reminderData,
      examUrl
    }
  })
}

// ==========================================
// EMAIL TESTING FUNCTION
// ==========================================

export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  try {
    const success = await sendEmail({
      to: testEmail,
      subject: 'UTME Master - Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that your UTME Master email configuration is working correctly.</p>
        <p>If you received this email, your SMTP settings are configured properly.</p>
        <p><strong>Test sent at:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p><em>UTME Master Email Service</em></p>
      `,
      text: `Email Configuration Test

This is a test email to verify that your UTME Master email configuration is working correctly.

If you received this email, your SMTP settings are configured properly.

Test sent at: ${new Date().toLocaleString()}

UTME Master Email Service`
    })
    
    return success
  } catch (error) {
    logger.error('Email configuration test failed:', error)
    return false
  }
}

// ==========================================
// BULK EMAIL FUNCTIONS
// ==========================================

export async function sendBulkEmails(emails: EmailOptions[]): Promise<{
  successful: number;
  failed: number;
  results: Array<{ email: string; success: boolean; error?: string }>;
}> {
  const results = []
  let successful = 0
  let failed = 0

  for (const emailOptions of emails) {
    try {
      const success = await sendEmail(emailOptions)
      if (success) {
        successful++
        results.push({ email: Array.isArray(emailOptions.to) ? emailOptions.to.join(', ') : emailOptions.to, success: true })
      } else {
        failed++
        results.push({ email: Array.isArray(emailOptions.to) ? emailOptions.to.join(', ') : emailOptions.to, success: false, error: 'Send failed' })
      }
    } catch (error) {
      failed++
      results.push({ 
        email: Array.isArray(emailOptions.to) ? emailOptions.to.join(', ') : emailOptions.to, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  return { successful, failed, results }
}