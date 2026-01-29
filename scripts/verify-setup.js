const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Trenz setup...\n');

// Check if .env exists and has required variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDatabase = envContent.includes('DATABASE_URL=');
  const hasJwtSecret = envContent.includes('JWT_SECRET=');
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=');
  
  console.log('📄 Environment Configuration:');
  console.log(`   ✅ .env file exists`);
  console.log(`   ${hasDatabase ? '✅' : '❌'} DATABASE_URL configured`);
  console.log(`   ${hasJwtSecret ? '✅' : '❌'} JWT_SECRET configured`);
  console.log(`   ${hasNextAuthSecret ? '✅' : '❌'} NEXTAUTH_SECRET configured`);
} else {
  console.log('❌ .env file not found');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const hasNodeModules = fs.existsSync(nodeModulesPath);
console.log(`\n📦 Dependencies:`);
console.log(`   ${hasNodeModules ? '✅' : '❌'} node_modules installed`);

// Check if Prisma client is generated
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
const hasPrismaClient = fs.existsSync(prismaClientPath);
console.log(`   ${hasPrismaClient ? '✅' : '❌'} Prisma client generated`);

// Check key directories
const srcPath = path.join(__dirname, '..', 'src');
const componentsPath = path.join(__dirname, '..', 'src', 'components');
const apiPath = path.join(__dirname, '..', 'app', 'api');

console.log(`\n📁 Project Structure:`);
console.log(`   ${fs.existsSync(srcPath) ? '✅' : '❌'} src/ directory`);
console.log(`   ${fs.existsSync(componentsPath) ? '✅' : '❌'} src/components/ directory`);
console.log(`   ${fs.existsSync(apiPath) ? '✅' : '❌'} app/api/ directory`);

// Check if uploads directory exists
const uploadsPath = path.join(__dirname, '..', 'public', 'uploads');
const hasUploads = fs.existsSync(uploadsPath);
console.log(`   ${hasUploads ? '✅' : '❌'} public/uploads/ directory`);

console.log('\n🎯 Next Steps:');
console.log('   1. Make sure MySQL is running');
console.log('   2. Update DATABASE_URL in .env with your MySQL credentials');
console.log('   3. Run: npm run setup-db (if not done already)');
console.log('   4. Run: npm run dev');
console.log('   5. Visit: http://localhost:3000');

console.log('\n🔐 Test Accounts:');
console.log('   Email: alice@example.com | Password: password123');
console.log('   Email: bob@example.com   | Password: password123');
console.log('   Email: charlie@example.com | Password: password123');

console.log('\n✅ Setup verification complete!');