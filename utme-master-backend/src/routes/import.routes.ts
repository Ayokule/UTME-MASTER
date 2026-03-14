// ==========================================
// IMPORT ROUTES
// ==========================================
// This file defines API endpoints for bulk import
//
// Features:
// - Upload Excel/CSV file
// - Import questions in bulk
// - Download template file

import { Router } from 'express'
import * as importController from '../controllers/import.controller'
import { authenticate, authorizeRole } from '../middleware/auth.middleware'
import { upload } from '../config/multer'

// Create router
const router = Router()

// ==========================================
// DOWNLOAD TEMPLATE
// ==========================================
// GET /api/import/template
//
// Download Excel template with example data
// Anyone can download (no auth required)
//
// Response:
// - Excel file (.xlsx)
// - Filename: question_import_template.xlsx
//
// Usage:
// 1. Download template
// 2. Fill with your questions
// 3. Upload via POST /api/import/questions

router.get(
  '/template',
  importController.downloadTemplate
)

// ==========================================
// BULK IMPORT QUESTIONS
// ==========================================
// POST /api/import/questions
//
// Upload Excel/CSV file and import questions
// Only ADMIN or TEACHER can import
//
// Request:
// - Content-Type: multipart/form-data
// - Field: file (Excel or CSV file)
//
// Middleware chain:
// 1. authenticate - Check if user is logged in
// 2. authorizeRole - Check if user is ADMIN or TEACHER
// 3. upload.single('file') - Handle file upload
//    - Validates file type (Excel/CSV only)
//    - Validates file size (max 5MB)
//    - Stores file in memory (req.file.buffer)
// 4. importController.bulkImportQuestions - Process file
//
// Response:
// {
//   success: true,
//   message: "Import completed: 45 success, 5 errors",
//   data: {
//     totalRows: 50,
//     successCount: 45,
//     errorCount: 5,
//     results: [...]
//   }
// }

router.post(
  '/questions',
  authenticate,                           // Must be logged in
  authorizeRole(['ADMIN', 'TEACHER']),   // Must be ADMIN or TEACHER
  upload.single('file'),                  // Handle file upload
  importController.bulkImportQuestions    // Process import
)

// ==========================================
// EXPORT ROUTER
// ==========================================
// This router is imported in server.ts
// and mounted at /api/import
//
// Final endpoints:
// GET  /api/import/template          (download template)
// POST /api/import/questions         (bulk import)

export default router

// ==========================================
// HOW TO USE FROM FRONTEND
// ==========================================
//
// 1. DOWNLOAD TEMPLATE:
//
// <a href="/api/import/template" download>
//   Download Template
// </a>
//
// Or with JavaScript:
// fetch('/api/import/template')
//   .then(res => res.blob())
//   .then(blob => {
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = 'question_import_template.xlsx'
//     a.click()
//   })
//
// 2. UPLOAD FILE:
//
// <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" />
// <button onclick="uploadFile()">Upload</button>
//
// <script>
// async function uploadFile() {
//   const fileInput = document.getElementById('fileInput')
//   const file = fileInput.files[0]
//   
//   if (!file) {
//     alert('Please select a file')
//     return
//   }
//   
//   // Create FormData
//   const formData = new FormData()
//   formData.append('file', file)
//   
//   // Upload
//   const response = await fetch('/api/import/questions', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//     },
//     body: formData  // Don't set Content-Type! Browser does it automatically
//   })
//   
//   const data = await response.json()
//   
//   if (data.success) {
//     alert(data.message)
//     
//     // Show results
//     console.log('Total:', data.data.totalRows)
//     console.log('Success:', data.data.successCount)
//     console.log('Errors:', data.data.errorCount)
//     
//     // Show errors to user
//     const errors = data.data.results.filter(r => !r.success)
//     errors.forEach(error => {
//       console.error(`Row ${error.row}: ${error.error}`)
//     })
//   } else {
//     alert('Upload failed: ' + data.error.message)
//   }
// }
// </script>
//
// 3. REACT EXAMPLE:
//
// import { useState } from 'react'
//
// function BulkImport() {
//   const [file, setFile] = useState(null)
//   const [uploading, setUploading] = useState(false)
//   const [result, setResult] = useState(null)
//   
//   async function handleUpload() {
//     if (!file) return
//     
//     setUploading(true)
//     
//     const formData = new FormData()
//     formData.append('file', file)
//     
//     try {
//       const response = await fetch('/api/import/questions', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//         },
//         body: formData
//       })
//       
//       const data = await response.json()
//       setResult(data.data)
//       alert(data.message)
//     } catch (error) {
//       alert('Upload failed')
//     } finally {
//       setUploading(false)
//     }
//   }
//   
//   return (
//     <div>
//       <input
//         type="file"
//         accept=".xlsx,.xls,.csv"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <button onClick={handleUpload} disabled={!file || uploading}>
//         {uploading ? 'Uploading...' : 'Upload'}
//       </button>
//       
//       {result && (
//         <div>
//           <p>Success: {result.successCount}</p>
//           <p>Errors: {result.errorCount}</p>
//           <ul>
//             {result.results.filter(r => !r.success).map(r => (
//               <li key={r.row}>Row {r.row}: {r.error}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   )
// }
