const { execSync } = require('child_process');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Trenz database...\n');

    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Push database schema (for development)
    console.log('🗄️  Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // Run seeder
    console.log('🌱 Seeding database with sample data...');
    execSync('npx tsx src/lib/seed.ts', { stdio: 'inherit' });

    console.log('\n✅ Database setup complete!');
    console.log('\n📝 Sample accounts created:');
    console.log('   Email: alice@example.com | Password: password123');
    console.log('   Email: bob@example.com   | Password: password123');
    console.log('   Email: charlie@example.com | Password: password123');
    console.log('\n🚀 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();