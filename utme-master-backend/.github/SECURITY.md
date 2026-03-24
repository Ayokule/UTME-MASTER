# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security seriously at UTME Master. If you discover a security vulnerability, please report it to us immediately.

### How to Report

1. **Do not** create a public GitHub issue
2. Email us at security@utmemaster.com
3. Include the following information:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Time

We aim to respond to security reports within 48 hours and provide a detailed response within 72 hours.

### Process

1. We'll confirm receipt of your report
2. We'll investigate the vulnerability
3. We'll provide a timeline for the fix
4. We'll notify you when the fix is released
5. We'll credit you (if desired) in the release notes

## Security Best Practices

### For Developers

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Run `npm audit` regularly
- Keep dependencies updated
- Follow OWASP Top 10 guidelines

### For Users

- Use strong passwords
- Enable 2FA when available
- Keep your software updated
- Report security issues immediately

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- SQL injection prevention
- XSS protection
- Security headers

## Penetration Testing

We conduct regular security audits and penetration testing. If you'd like to request a penetration test, please contact us.

## Bug Bounty

We don't currently have a bug bounty program, but we greatly appreciate security research and will credit contributors in our release notes.

## Acknowledgments

We'd like to thank the following security researchers:

- [Researcher Name] - [Vulnerability]
- [Researcher Name] - [Vulnerability]

## Changelog

### 2024-01-01
- Initial security policy
