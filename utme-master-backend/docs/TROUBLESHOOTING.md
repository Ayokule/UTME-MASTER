# UTME Master Backend Troubleshooting Guide

## Common Issues and Solutions

---

## Database Issues

### 1. Connection Refused

**Error:**
```
Error: P1000: Database connection failed
ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Or on Windows
net start postgresql-x64-15
```

---

### 2. Authentication Failed

**Error:**
```
Error: P1000: Database connection failed
FATAL: password authentication failed for user "username"
```

**Solution:**
- Verify username and password in `.env`
- Check PostgreSQL user permissions
- Reset password if needed:

```sql
ALTER USER username WITH PASSWORD 'new_password';
```

---

### 3. Database Does Not Exist

**Error:**
```
Error: P1000: Database connection failed
FATAL: database "utme_master" does not exist
```

**Solution:**
```sql
CREATE DATABASE utme_master;
GRANT ALL PRIVILEGES ON DATABASE utme_master TO username;
```

---

### 4. Migration Failed

**Error:**
```
Error: P3006: Migration failed
```

**Solution:**
```bash
# Check migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset

# Or fix and reapply
npx prisma migrate dev
```

---

## Authentication Issues

### 1. Invalid Token

**Error:**
```
JsonWebTokenError: invalid token
```

**Solution:**
- Verify JWT_SECRET matches between token creation and verification
- Check token expiration
- Ensure token is sent in Authorization header:

```bash
Authorization: Bearer <token>
```

---

### 2. Token Expired

**Error:**
```
TokenExpiredError: jwt expired
```

**Solution:**
- User needs to log in again
- Consider implementing token refresh mechanism

---

### 3. Account Not Found

**Error:**
```
NotFoundError: User not found
```

**Solution:**
- User account may have been deleted
- User needs to register again

---

## API Issues

### 1. 404 Not Found

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Cannot GET /api/endpoint"
  }
}
```

**Solution:**
- Verify endpoint URL
- Check if route is registered in server.ts
- Ensure correct HTTP method (GET, POST, PUT, DELETE)

---

### 2. 400 Bad Request

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}
```

**Solution:**
- Check request body for required fields
- Verify data types match expected format
- Review validation schema

---

### 3. 403 Forbidden

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. Required role: ADMIN"
  }
}
```

**Solution:**
- User doesn't have required role
- Check user role in database
- Verify role middleware is applied correctly

---

## Performance Issues

### 1. Slow Queries

**Symptoms:**
- API responses taking too long
- Database connection timeouts

**Solution:**
```sql
-- Enable query logging
ALTER DATABASE utme_master SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT * FROM pg_stat_statements;
```

**Optimization:**
- Add database indexes
- Use eager loading for related data
- Implement caching

---

### 2. High Memory Usage

**Symptoms:**
- Node process consuming too much memory
- OOM errors

**Solution:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/server.js

# Or set in package.json
"scripts": {
  "start": "node --max-old-space-size=4096 dist/server.js"
}
```

---

### 3. Rate Limiting

**Error:**
```
Too many requests
```

**Solution:**
- Rate limiting is enabled by default
- Configure in `server.ts`:

```typescript
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
}));
```

---

## File Upload Issues

### 1. File Too Large

**Error:**
```
Request entity too large
```

**Solution:**
- Increase upload limit in `server.ts`:

```typescript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

---

### 2. Invalid File Type

**Error:**
```
Invalid file type
```

**Solution:**
- Check allowed file types in upload controller
- Verify file extension and MIME type

---

## Email Issues

### 1. SMTP Connection Failed

**Error:**
```
Error: SMTP connection failed
```

**Solution:**
- Verify SMTP credentials in `.env`
- Check SMTP server is accessible
- Verify firewall settings

---

### 2. Email Not Sent

**Symptoms:**
- No error but email not received

**Solution:**
- Check email logs
- Verify email configuration
- Test with different email address

---

## Logging Issues

### 1. No Logs

**Symptoms:**
- No log output

**Solution:**
- Check LOG_LEVEL in `.env`:

```env
LOG_LEVEL=debug
```

---

### 2. Logs Not Written to File

**Symptoms:**
- Logs only in console

**Solution:**
- Check Winston transport configuration
- Verify logs directory exists and is writable

---

## Security Issues

### 1. CORS Error

**Error:**
```
Access to fetch at 'http://localhost:5000/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
- Configure CORS in `server.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

### 2. SQL Injection Attempt

**Symptoms:**
- Suspicious queries in logs

**Solution:**
- Use parameterized queries (Prisma handles this)
- Never concatenate SQL strings
- Validate all user inputs

---

## Deployment Issues

### 1. Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>
```

---

### 2. Build Failed

**Error:**
```
Error: Cannot find module
```

**Solution:**
```bash
# Clean build
rm -rf dist
npm run build
```

---

### 3. Prisma Client Not Found

**Error:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Or reinstall
npm install @prisma/client
```

---

## Debugging Tips

### 1. Enable Debug Logging

```env
LOG_LEVEL=debug
```

### 2. Use Prisma Studio

```bash
npx prisma studio
```

### 3. Check Environment Variables

```bash
node -e "console.log(process.env)"
```

### 4. Test Database Connection

```bash
npx prisma db execute --query "SELECT 1"
```

---

## Getting Help

### 1. Check Logs

```bash
# View application logs
tail -f logs/error.log

# View system logs
journalctl -u utme-master-backend
```

### 2. Enable Stack Traces

```env
NODE_ENV=development
```

### 3. Use Debugging Tools

- **VS Code:** Use debugger with `launch.json`
- **Chrome DevTools:** For frontend debugging
- **Postman:** Test API endpoints

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `BAD_REQUEST` | 400 | Invalid request data |
| `VALIDATION_ERROR` | 400 | Validation failed |
| `DATABASE_ERROR` | 400 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Maintenance Tasks

### 1. Database Backup

```bash
pg_dump -U username -d utme_master > backup.sql
```

### 2. Clear Old Logs

```bash
find logs -name "*.log" -mtime +30 -delete
```

### 3. Update Dependencies

```bash
npm outdated
npm update
```

### 4. Check for Security Vulnerabilities

```bash
npm audit
npm audit fix
```

---

## Performance Monitoring

### 1. Check Server Uptime

```bash
curl http://localhost:5000/api/health
```

### 2. Monitor Database Connections

```sql
SELECT count(*) FROM pg_stat_activity;
```

### 3. Check Query Performance

```sql
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## Emergency Procedures

### 1. Server Crash

```bash
# Restart server
pm2 restart utme-master-backend

# Or manually
npm start
```

### 2. Database Corruption

```bash
# Restore from backup
psql -U username -d utme_master < backup.sql
```

### 3. Security Breach

```bash
# Rotate JWT secret
# Update JWT_SECRET in .env
# Invalidate all tokens
```
