const crypto = require('crypto');

console.log('🔐 Generating secure secrets for Trenz...\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy these values to your .env file:\n');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);

console.log('\n✅ Secrets generated successfully!');
console.log('⚠️  Keep these secrets secure and never commit them to version control.');