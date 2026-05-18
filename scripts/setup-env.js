#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

// Generate environment configuration
const envConfig = `# Faculty Recruitment System Environment Variables
# Generated on ${new Date().toISOString()}

# NextAuth Configuration
NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('hex')}
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/recruitment_db

# Application Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Optional - for password reset)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Judge0 API Configuration (Optional - for coding assessments)
# JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
# JUDGE0_API_KEY=your-rapidapi-key
`;

// Write to .env.local
fs.writeFileSync('.env.local', envConfig);

console.log('✅ Environment configuration created at .env.local');
console.log('📝 You can customize the values in .env.local as needed');
console.log('🔑 A random NEXTAUTH_SECRET has been generated for you');
