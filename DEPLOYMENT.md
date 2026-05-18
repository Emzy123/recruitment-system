# Faculty Recruitment System - Deployment Guide

This guide covers various deployment options for the Faculty Recruitment System.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **MongoDB**: 5.0 or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Stable internet connection

### Optional Services
- **Email Service**: SMTP server for password reset (Gmail, SendGrid, etc.)
- **Code Assessment**: Judge0 API for automated coding assessments
- **SSL Certificate**: For HTTPS in production

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd recruitment-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Generate environment file
node scripts/setup-env.js

# Or create manually
cp .env.example .env.local
```

### 4. Required Environment Variables
```bash
# Authentication
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb://localhost:27017/recruitment_db

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Code Assessment
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key
```

## Development Deployment

### Quick Start
```bash
# Start MongoDB (if not running)
mongod

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Default Login Credentials
- **Admin**: `admin@example.com` / `Admin123!`
- **Committee**: `committee@example.com` / `Committee123!`
- **Assessor**: `assessor@example.com` / `Assessor123!`
- **Candidate**: `candidate@example.com` / `Candidate123!`

## Production Deployment

### 1. Build the Application
```bash
npm run build
npm run start
```

### 2. Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start npm --name "recruitment-system" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Production Configuration
```bash
# Set production mode
export NODE_ENV=production

# Build optimized version
npm run build

# Start production server
npm run start
```

## Docker Deployment

### 1. Using Docker Compose (Recommended)
```bash
# Create production environment file
cp .env.example .env.production

# Edit .env.production with production values

# Start all services
docker-compose -f docker-compose.yml --env-file .env.production up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Manual Docker Deployment
```bash
# Build Docker image
docker build -t recruitment-system .

# Run container
docker run -d \
  --name recruitment-system \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/recruitment_db \
  -e NEXTAUTH_SECRET=your-secret \
  recruitment-system
```

### 3. Docker Compose Services
- **app**: Next.js application server
- **mongo**: MongoDB database with persistent storage
- **nginx**: Reverse proxy with SSL termination and rate limiting

## Cloud Deployment

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### AWS EC2
```bash
# Launch EC2 instance (Ubuntu 20.04 LTS recommended)
# Install Docker and Docker Compose
# Clone repository and deploy using Docker Compose
```

### DigitalOcean
```bash
# Create Droplet with Docker pre-installed
# Deploy using Docker Compose
# Configure firewall and SSL
```

### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name

# Set environment variables
heroku config:set NEXTAUTH_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

## Monitoring & Maintenance

### Health Checks
```bash
# Application health endpoint
curl http://localhost:3000/api/health

# Database connectivity
curl http://localhost:3000/api/health/db
```

### Log Management
```bash
# View application logs
pm2 logs recruitment-system

# Docker logs
docker-compose logs app

# System logs
tail -f /var/log/syslog
```

### Backup Strategy
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/recruitment_db" --out=/backup/$(date +%Y%m%d)

# Automated backup script
./scripts/backup.sh
```

### Performance Monitoring
- Monitor response times and error rates
- Set up alerts for high CPU/memory usage
- Regular database performance analysis
- SSL certificate expiry monitoring

### Security Maintenance
- Regular dependency updates: `npm audit fix`
- Security scanning: `npm audit`
- Log rotation and cleanup
- Access control review

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017/recruitment_db"

# Check network connectivity
telnet localhost 27017
```

#### Authentication Issues
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Check NEXTAUTH_URL matches deployment domain
```

### Performance Issues
- Enable database indexing
- Implement caching strategies
- Optimize image sizes
- Use CDN for static assets

### Scaling Considerations
- Horizontal scaling with load balancers
- Database read replicas
- Redis for session storage
- File storage for uploads

## Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review system resources

For additional support, refer to the project documentation or create an issue in the repository.
