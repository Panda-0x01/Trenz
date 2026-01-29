# 🚀 Trenz Setup Guide

Follow these steps to get Trenz running on your local machine.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **MySQL 8.0+** - [Download here](https://dev.mysql.com/downloads/mysql/) or use XAMPP/WAMP

## Step 1: Database Setup

### Option A: Using MySQL directly
1. Install MySQL and start the service
2. Create a new database:
   ```sql
   CREATE DATABASE trenz_db;
   ```
3. Note your MySQL username and password

### Option B: Using XAMPP/WAMP (Easier for beginners)
1. Download and install [XAMPP](https://www.apachefriends.org/) or [WAMP](https://www.wampserver.com/)
2. Start Apache and MySQL services
3. Open phpMyAdmin (usually at http://localhost/phpmyadmin)
4. Create a new database named `trenz_db`

## Step 2: Configure Environment Variables

1. Open the `.env` file in the `trenz-app` folder
2. Update the `DATABASE_URL` based on your setup:

### For MySQL with password:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/trenz_db"
```

### For XAMPP/WAMP (usually no password):
```env
DATABASE_URL="mysql://root:@localhost:3306/trenz_db"
```

### For custom MySQL setup:
```env
DATABASE_URL="mysql://yourusername:yourpassword@localhost:3306/trenz_db"
```

3. **Generate secure secrets** (IMPORTANT for security):

### Option A: Using Node.js (Recommended)
Open terminal and run:
```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Option B: Using online generator
Visit https://generate-secret.vercel.app/32 and generate two different secrets

4. Replace the secrets in `.env`:
```env
JWT_SECRET="your_generated_jwt_secret_here"
NEXTAUTH_SECRET="your_generated_nextauth_secret_here"
```

## Step 3: Install Dependencies and Setup Database

1. Open terminal in the `trenz-app` folder
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database (this will create tables and add sample data):
   ```bash
   npm run setup-db
   ```

   You should see output like:
   ```
   🚀 Setting up Trenz database...
   📦 Generating Prisma client...
   🗄️  Pushing database schema...
   🌱 Seeding database with sample data...
   ✅ Database setup complete!
   ```

## Step 4: Start the Application

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

## Step 5: Test with Sample Accounts

The setup created these test accounts:

| Email | Password | User |
|-------|----------|------|
| alice@example.com | password123 | Alice Johnson (Verified) |
| bob@example.com | password123 | Bob Smith |
| charlie@example.com | password123 | Charlie Brown |

## Troubleshooting

### Database Connection Issues

**Error: "Access denied for user"**
- Check your MySQL username/password in DATABASE_URL
- Make sure MySQL service is running

**Error: "Unknown database 'trenz_db'"**
- Create the database manually in MySQL/phpMyAdmin
- Make sure the database name matches in DATABASE_URL

**Error: "connect ECONNREFUSED"**
- Make sure MySQL is running
- Check if the port (3306) is correct
- For XAMPP/WAMP, start the MySQL service

### Port Issues

**Error: "Port 3000 is already in use"**
```bash
# Use a different port
npm run dev -- -p 3001
```

### Permission Issues

**Error: "EACCES: permission denied"**
```bash
# On macOS/Linux, you might need:
sudo npm install
# Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors
```

## Next Steps

1. **Explore the app**: Try creating posts, following users, joining trends
2. **Customize**: Modify components in `src/components/`
3. **Add features**: Check the API routes in `app/api/`
4. **Deploy**: Follow deployment guides for Vercel, Railway, or your preferred platform

## Need Help?

- Check the main README.md for detailed documentation
- Look at the database schema in `prisma/schema.prisma`
- Review API endpoints in `app/api/` folders
- Check browser console for error messages

## Security Notes

- **Never commit `.env` to version control**
- **Change default secrets before production**
- **Use strong passwords for database**
- **Enable HTTPS in production**