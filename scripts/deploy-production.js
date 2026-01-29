#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if .env.production exists
if (!fs.existsSync('.env.production')) {
  console.error('❌ Error: .env.production file not found. Please create it with production environment variables.');
  process.exit(1);
}

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --only=production', { stdio: 'inherit' });

  // Step 2: Generate Prisma client
  console.log('🗄️  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Step 3: Run database migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  // Step 4: Type check
  console.log('🔍 Running type check...');
  execSync('npm run type-check', { stdio: 'inherit' });

  // Step 5: Lint check
  console.log('🧹 Running lint check...');
  execSync('npm run lint:check', { stdio: 'inherit' });

  // Step 6: Build the application
  console.log('🏗️  Building application...');
  execSync('npm run build:production', { stdio: 'inherit' });

  // Step 7: Create production directories
  console.log('📁 Creating production directories...');
  const uploadDirs = [
    'public/uploads',
    'public/uploads/posts',
    'public/uploads/profiles',
    'public/uploads/headers',
    'public/uploads/stories'
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✅ Created ${dir}`);
    }
  });

  // Step 8: Set proper permissions (Unix-like systems only)
  if (process.platform !== 'win32') {
    console.log('🔐 Setting file permissions...');
    execSync('chmod -R 755 public/uploads', { stdio: 'inherit' });
  }

  // Step 9: Create systemd service file (optional)
  const serviceName = 'trenz-app';
  const serviceFile = `[Unit]
Description=Trenz Social Media App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${process.cwd()}
Environment=NODE_ENV=production
ExecStart=${process.execPath} server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target`;

  fs.writeFileSync(`${serviceName}.service`, serviceFile);
  console.log(`📋 Created ${serviceName}.service file for systemd`);

  // Step 10: Create production server file
  const serverFile = `const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(\`> Ready on http://\${hostname}:\${port}\`);
    });
});`;

  fs.writeFileSync('server.js', serverFile);
  console.log('🖥️  Created production server.js');

  // Step 11: Create nginx configuration
  const nginxConfig = `server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /_next/static/ {
        alias ${process.cwd()}/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias ${process.cwd()}/public/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  fs.writeFileSync('nginx.conf', nginxConfig);
  console.log('🌐 Created nginx.conf');

  console.log('\n✅ Production deployment preparation complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Copy .env.production to your server');
  console.log('2. Update database connection strings in .env.production');
  console.log('3. Configure SSL certificates in nginx.conf');
  console.log('4. Copy trenz-app.service to /etc/systemd/system/');
  console.log('5. Run: sudo systemctl enable trenz-app && sudo systemctl start trenz-app');
  console.log('6. Configure nginx with the provided nginx.conf');
  console.log('\n🚀 Your Trenz app is ready for production!');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}