const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addStoriesTable() {
  try {
    console.log('Adding stories table...');
    
    // The table will be created when you run: npx prisma db push
    // This script is just for reference
    
    console.log('✅ Stories table schema updated in prisma/schema.prisma');
    console.log('Run "npx prisma db push" to apply changes to your database');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStoriesTable();