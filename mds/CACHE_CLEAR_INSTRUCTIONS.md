# Browser Cache Issue - Fix Instructions

## Problem
Frontend is still sending requests to `/api/api/exams/practice/start` (double /api) even though the code has been updated to `/exams/practice/start`.

## Root Cause
Browser is serving cached JavaScript files from the previous build.

## Solution

### Option 1: Hard Refresh (Quickest)
**Windows/Linux:**
- Press `Ctrl + Shift + R` in the browser

**Mac:**
- Press `Cmd + Shift + R` in the browser

### Option 2: Clear Browser Cache
1. Open Developer Tools (F12 or Cmd+Option+I)
2. Right-click the refresh button
3. Select "Empty cache and hard refresh"

### Option 3: Clear All Browser Data
1. Open Settings
2. Go to Privacy/History
3. Clear browsing data
4. Select "All time"
5. Check "Cached images and files"
6. Click "Clear data"

### Option 4: Restart Dev Server
If using Vite dev server:
1. Stop the dev server (Ctrl+C)
2. Delete `.vite` folder (if exists)
3. Run `npm run dev` again
4. Refresh browser

### Option 5: Incognito/Private Mode
Open the app in a new incognito/private window to bypass cache entirely.

## Verification
After clearing cache, check the Network tab in DevTools:
- Should see `POST /api/exams/practice/start` ✅
- NOT `POST /api/api/exams/practice/start` ❌

## What Was Fixed
All exam API endpoints were updated to remove the double `/api` prefix:

| Endpoint | Before | After |
|----------|--------|-------|
| Start Practice Exam | `/api/exams/practice/start` | `/exams/practice/start` |
| Start Exam | `/api/exams/{id}/start` | `/exams/{id}/start` |
| Resume Exam | `/api/exams/resume/{id}` | `/exams/resume/{id}` |
| Submit Answer | `/api/exams/{id}/answers` | `/exams/{id}/answers` |
| Submit Exam | `/api/exams/{id}/submit` | `/exams/{id}/submit` |
| Get Results | `/api/exams/results/{id}` | `/exams/results/{id}` |
| Review Questions | `/api/exams/results/{id}/review` | `/exams/results/{id}/review` |

The `apiClient` already has `/api` as the base URL, so adding `/api` in the endpoint path creates a double prefix.
