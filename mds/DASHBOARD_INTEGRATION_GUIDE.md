# UTME Master Dashboard Integration Guide

**Version**: 1.0  
**Last Updated**: 2026-03-14  
**Status**: Production Ready  
**Target Audience**: Full-stack developers integrating dashboard components

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Type Definitions](#type-definitions)
4. [API Client Setup](#api-client-setup)
5. [Data Flow](#data-flow)
6. [Component Integration](#component-integration)
7. [Setup Instructions](#setup-instructions)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

---

## Overview

The UTME Master dashboard displays student performance analytics for Nigerian exam preparation (JAMB, WAEC, NECO). This guide covers integrating the React frontend with Express.js backend APIs.

### Key Features
- **Real-time Performance Tracking**: View scores across JAMB subjects
- **Progress Analytics**: Track improvement over time
- **Subject Performance**: Compare performance across Mathematics, English, Physics, Chemistry, Biology, etc.
- **Premium Features**: JAMB score predictions (TRIAL/PREMIUM users only)
- **Study Recommendations**: Personalized tips based on performance

### Tech Stack
- **Frontend**: React 18+, TypeScript, Framer Motion, Recharts
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **Authentication**: JWT tokens
- **State Management**: React hooks + Context API

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    UTME Master Dashboard                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Dashboard.tsx (Parent Component)             │   │
│  │  - Fetches data from API                             │   │
│  │  - Manages loading/error states                      │   │
│  │  - Distributes data to children                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│         ┌────────────────┼────────────────┐                  │
│         │                │                │                  │
│    ┌────▼────┐    ┌─────▼──────┐   ┌────▼────┐             │
│    │Progress │    │  Subject   │   │ Recent  │             │
│    │ Chart   │    │Performance │   │Activity │             │
│    └─────────┘    └────────────┘   └─────────┘             │
│                                                               │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│    │  Strengths & │  │ Stat Cards   │  │  Premium    │    │
│    │ Weaknesses   │  │              │  │  Upgrade    │    │
│    └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ API Calls
                          │
┌─────────────────────────▼──────────────────────────────────┐
│              Backend API (Express.js)                       │
├──────────────────────────────────────────────────────────┤
│                                                              │
│  GET /api/student/dashboard                                │
│  GET /api/student/analytics/subject/:subject               │
│  GET /api/student/analytics/predicted-score                │
│  GET /api/student/recommendations                          │
│                                                              │
└──────────────────────────────────────────────────────────┘
                          │
                          │ Database Queries
                          │
┌─────────────────────────▼──────────────────────────────────┐
│           PostgreSQL Database (Prisma ORM)                 │
├──────────────────────────────────────────────────────────┤
│  - StudentExam records                                     │
│  - StudentAnswer records                                   │
│  - Subject performance data                                │
│  - User license tier information                           │
└──────────────────────────────────────────────────────────┘
```

---

## Type Definitions

### Complete Type System

Create or update `src/types/dashboard.ts`:

```typescript
/**
 * Dashboard Type Definitions
 * 
 * These interfaces define the shape of data flowing through the dashboard.
 * All API responses should conform to these types.
 * 
 * Nigerian Context:
 * - JAMB: Joint Admissions and Matriculation Board (main exam)
 * - WAEC: West African Examinations Council
 * - NECO: National Examination Council
 */

// ==========================================
// STATISTICS INTERFACE
// ==========================================
/**
 * Student performance statistics
 * 
 * @property total_tests - Total number of exams completed
 * @property average_score - Average score across all exams (0-100)
 * @property best_score - Highest score achieved (0-100)
 * @property hours_studied - Total study time in hours
 */
export interface DashboardStats {
  total_tests: number
  average_score: number
  best_score: number
  hours_studied: number
}

// ==========================================
// SUBJECT PERFORMANCE INTERFACE
// ==========================================
/**
 * Performance data for a single subject
 * 
 * Used for: Subject Performance Chart
 * 
 * @property subject - Subject name (e.g., "Mathematics", "English")
 * @property score - Average score in this subject (0-100)
 * @property tests - Number of tests taken in this subject
 * @property color - Optional hex color for chart visualization
 */
export interface SubjectPerformance {
  subject: string
  score: number
  tests: number
  color?: string
}

// ==========================================
// PROGRESS POINT INTERFACE
// ==========================================
/**
 * Single data point for progress tracking
 * 
 * Used for: Progress Over Time Chart
 * 
 * @property date - ISO date string (YYYY-MM-DD)
 * @property score - Score achieved on this date (0-100)
 * @property exam_title - Optional exam name for tooltip
 */
export interface ProgressPoint {
  date: string
  score: number
  exam_title?: string
}

// ==========================================
// RECENT ACTIVITY INTERFACE
// ==========================================
/**
 * Recent exam activity record
 * 
 * Used for: Recent Activity Component
 * 
 * @property id - Unique activity ID
 * @property exam_title - Name of the exam taken
 * @property score - Raw score achieved
 * @property percentage - Score as percentage (0-100)
 * @property date - ISO timestamp of completion
 * @property subjects - Array of subjects in the exam
 * @property status - Current status of the exam
 */
export interface RecentActivity {
  id: string
  exam_title: string
  score: number
  percentage: number
  date: string
  subjects: string[]
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED'
}

// ==========================================
// STUDENT INFO INTERFACE
// ==========================================
/**
 * Student profile information
 * 
 * @property name - Student's full name
 * @property streak_days - Consecutive days of study
 * @property license_tier - Subscription level
 */
export interface StudentInfo {
  name: string
  streak_days: number
  license_tier: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
}

// ==========================================
// MAIN DASHBOARD DATA INTERFACE
// ==========================================
/**
 * Complete dashboard data structure
 * 
 * This is the main response from GET /api/student/dashboard
 * All child components receive subsets of this data.
 * 
 * @property student - Student profile information
 * @property stats - Performance statistics
 * @property subject_performance - Array of subject scores
 * @property progress - Array of progress points over time
 * @property recent_activity - Array of recent exam activities
 * @property strengths - Array of subject names where student excels
 * @property weaknesses - Array of subject names needing improvement
 * @property quote_of_day - Motivational quote for the student
 */
export interface DashboardData {
  student: StudentInfo
  stats: DashboardStats
  subject_performance: SubjectPerformance[]
  progress: ProgressPoint[]
  recent_activity: RecentActivity[]
  strengths: string[]
  weaknesses: string[]
  quote_of_day?: string
}

// ==========================================
// STAT CARD PROPS INTERFACE
// ==========================================
/**
 * Props for StatCard component
 * 
 * Used for: Displaying individual statistics
 * 
 * @property icon - React node for the icon
 * @property label - Label text (e.g., "Tests Taken")
 * @property value - The statistic value
 * @property change - Optional change indicator (e.g., "+5")
 * @property trend - Direction of change
 */
export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

// ==========================================
// API RESPONSE WRAPPER
// ==========================================
/**
 * Standard API response structure
 * 
 * All backend endpoints return this format:
 * {
 *   success: true,
 *   data: { ... actual data ... }
 * }
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// ==========================================
// ERROR RESPONSE INTERFACE
// ==========================================
/**
 * Error response from API
 * 
 * @property success - Always false for errors
 * @property message - Human-readable error message
 * @property error - Technical error details
 * @property status - HTTP status code
 */
export interface ApiErrorResponse {
  success: false
  message: string
  error?: string
  status?: number
}
```

---

## API Client Setup

### Enhanced API Client

Create `src/api/dashboardClient.ts`:

```typescript
/**
 * Dashboard API Client
 * 
 * Handles all API communication for the dashboard.
 * Includes error handling, retry logic, and type safety.
 * 
 * Endpoint Convention: /api/student/...
 * All endpoints require JWT authentication
 */

import apiClient from './client'
import {
  DashboardData,
  ApiResponse,
  ApiErrorResponse
} from '../types/dashboard'

// ==========================================
// CONFIGURATION
// ==========================================

const API_BASE = '/api/student'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Retry logic for failed requests
 * Implements exponential backoff
 */
async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => 
        setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1))
      )
      return retryRequest(fn, retries - 1)
    }
    throw error
  }
}

/**
 * Extract data from API response
 * Handles both wrapped and unwrapped responses
 */
function extractData<T>(response: any): T {
  return response.data?.data || response.data
}

/**
 * Handle API errors with meaningful messages
 */
function handleError(error: any): never {
  const status = error.response?.status
  const message = error.response?.data?.message || error.message

  console.error('[Dashboard API Error]', {
    status,
    message,
    url: error.config?.url,
    timestamp: new Date().toISOString()
  })

  if (status === 401) {
    throw new Error('Authentication failed. Please log in again.')
  }
  if (status === 403) {
    throw new Error('Access denied. This feature requires a premium subscription.')
  }
  if (status === 404) {
    throw new Error('Resource not found.')
  }
  if (status >= 500) {
    throw new Error('Server error. Please try again later.')
  }

  throw new Error(message || 'An error occurred')
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch main dashboard data
 * 
 * Returns comprehensive student performance analytics
 * 
 * @returns DashboardData with all dashboard information
 * @throws Error if request fails
 * 
 * Example:
 * const data = await getDashboardData()
 * console.log(data.stats.average_score) // 75.5
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get(`${API_BASE}/dashboard`)
      return extractData<DashboardData>(response)
    })
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get detailed subject analytics
 * 
 * Premium feature - only available for TRIAL/PREMIUM users
 * 
 * @param subject - Subject name (e.g., "Mathematics")
 * @returns Subject-specific analytics
 * @throws Error if user lacks permission or subject not found
 * 
 * Example:
 * const math = await getSubjectAnalytics('Mathematics')
 */
export const getSubjectAnalytics = async (subject: string) => {
  try {
    return await retryRequest(async () => {
      const encoded = encodeURIComponent(subject)
      const response = await apiClient.get(
        `${API_BASE}/analytics/subject/${encoded}`
      )
      return extractData(response)
    })
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get predicted JAMB score
 * 
 * Premium feature - AI-powered prediction based on recent exams
 * Only available for TRIAL/PREMIUM users
 * 
 * @returns Predicted JAMB score (0-400) with confidence level
 * @throws Error if user lacks permission or insufficient data
 * 
 * Example:
 * const prediction = await getPredictedScore()
 * console.log(prediction.predicted_score) // 285
 */
export const getPredictedScore = async () => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get(
        `${API_BASE}/analytics/predicted-score`
      )
      return extractData(response)
    })
  } catch (error) {
    handleError(error)
  }
}

/**
 * Get personalized study recommendations
 * 
 * Available for all users (FREE, TRIAL, PREMIUM)
 * 
 * @returns Array of study recommendations based on performance
 * 
 * Example:
 * const tips = await getStudyRecommendations()
 * tips.recommendations.forEach(tip => console.log(tip))
 */
export const getStudyRecommendations = async () => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get(`${API_BASE}/recommendations`)
      return extractData(response)
    })
  } catch (error) {
    handleError(error)
  }
}

// ==========================================
// EXPORT
// ==========================================

export default {
  getDashboardData,
  getSubjectAnalytics,
  getPredictedScore,
  getStudyRecommendations
}
```

---

## Data Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Dashboard.tsx                              │
│                  (Parent Component)                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ useEffect(() => {
                          │   getDashboardData()
                          │ }, [])
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              API Client (dashboardClient.ts)                │
│                                                              │
│  GET /api/student/dashboard                                │
│  + Retry logic (3 attempts)                                │
│  + Error handling                                          │
│  + Type checking                                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Response:
                          │ {
                          │   success: true,
                          │   data: DashboardData
                          │ }
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Dashboard.tsx State Update                      │
│                                                              │
│  setDashboardData(data)                                    │
│  setLoading(false)                                         │
│  setError(null)                                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Destructure data:
                          │ const {
                          │   student,
                          │   stats,
                          │   subject_performance,
                          │   progress,
                          │   recent_activity,
                          │   strengths,
                          │   weaknesses,
                          │   quote_of_day
                          │ } = dashboardData
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌────────┐      ┌──────────┐      ┌─────────┐
    │Progress│      │ Subject  │      │ Recent  │
    │ Chart  │      │Performance      │Activity │
    └────────┘      └──────────┘      └─────────┘
    data: progress  data: subject_    data: recent_
                    performance       activity
        │                 │                 │
        ▼                 ▼                 ▼
    Render with      Render with      Render with
    null checks      null checks      null checks
```

### State Management Pattern

```typescript
// In Dashboard.tsx

const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await getDashboardData()
      setDashboardData(data)
      
    } catch (err: any) {
      setError(err.message)
      setDashboardData(null)
      
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])

// Render logic
if (loading) return <LoadingState />
if (error) return <ErrorState message={error} />
if (!dashboardData) return <EmptyState />

// Safe destructuring with defaults
const {
  student = { name: 'Student', streak_days: 0, license_tier: 'TRIAL' },
  stats = { total_tests: 0, average_score: 0, best_score: 0, hours_studied: 0 },
  subject_performance = [],
  progress = [],
  recent_activity = [],
  strengths = [],
  weaknesses = [],
  quote_of_day = ''
} = dashboardData

// Pass to children
return (
  <>
    <ProgressChart data={progress} />
    <SubjectPerformanceChart data={subject_performance} />
    <RecentActivity activities={recent_activity} />
  </>
)
```

