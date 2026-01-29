# 🎯 Trenz - Modern Social Media Platform

<div align="center">

![Trenz Logo](public/i2.png)

**A fully responsive, feature-rich social media platform built with Next.js 14, TypeScript, and Prisma**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)

[Live Demo](https://trenz-demo.vercel.app) • [Documentation](./PRODUCTION-DEPLOYMENT.md) • [Setup Guide](./SETUP-GUIDE.md)

</div>

## ✨ Features

### 🎨 **Modern UI/UX**
- **Fully Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Mobile Hamburger Menu** - Complete settings access on mobile devices
- **Dark/Light Mode** - Seamless theme switching
- **Touch-Optimized** - Mobile-first design approach

### 📱 **Core Social Features**
- **Posts & Media Sharing** - Images, videos, and text posts
- **Stories** - 24-hour ephemeral content with auto-cleanup
- **Real-time Messaging** - Direct messages between users
- **Trends & Competitions** - Participate in trending challenges
- **Leaderboards** - Competitive rankings and achievements
- **Comments & Interactions** - Like, comment, share, and save posts

### 🔐 **Security & Authentication**
- **JWT Authentication** - Secure token-based auth with refresh tokens
- **Rate Limiting** - Protection against spam and abuse
- **Input Validation** - Comprehensive data validation with Zod
- **File Upload Security** - Safe image and video processing
- **Privacy Controls** - Private accounts and content visibility settings

### 🚀 **Performance & Scalability**
- **Server-Side Rendering** - Fast initial page loads
- **Image Optimization** - Automatic WebP/AVIF conversion
- **Database Optimization** - Efficient Prisma queries with indexing
- **Caching Strategy** - Smart caching for better performance
- **Production Ready** - Comprehensive deployment configuration

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Sharp** - Image processing

### **DevOps & Production**
- **Docker** - Containerization support
- **Nginx** - Reverse proxy configuration
- **PM2** - Process management
- **Systemd** - Service management
- **SSL/TLS** - HTTPS configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Panda-0x01/Trenz.git
   cd Trenz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📱 Mobile Experience

### Responsive Design
- **Mobile First** - Optimized for mobile devices
- **Touch Friendly** - Large touch targets and smooth interactions
- **Hamburger Menu** - Complete navigation and settings access
- **Bottom Navigation** - Easy thumb navigation on mobile

### Breakpoints
- **Mobile (xs)**: < 640px - Full mobile experience
- **Tablet (sm/md)**: 640px - 1024px - Optimized tablet layout
- **Desktop (lg+)**: 1024px+ - Full desktop experience with sidebars

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/trenz"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./public/uploads"
```

### Database Schema

The project uses Prisma with MySQL. Key models include:
- **Users** - User accounts and profiles
- **Posts** - Content posts with media
- **Stories** - Ephemeral content
- **Messages** - Direct messaging
- **Trends** - Trending challenges
- **Comments** - Post interactions

## 🚀 Production Deployment

### Automated Deployment

```bash
# Run the production deployment script
node scripts/deploy-production.js
```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build:production
   ```

2. **Set up production environment**
   ```bash
   cp .env.production .env.local
   # Configure production variables
   ```

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start production server**
   ```bash
   npm run start:production
   ```

### Docker Deployment

```bash
# Build Docker image
docker build -t trenz-app .

# Run container
docker run -p 3000:3000 trenz-app
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Posts Endpoints
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `POST /api/posts/[id]/like` - Like/unlike post
- `DELETE /api/posts/[id]` - Delete post

### Messages Endpoints
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/[userId]` - Get messages with user
- `POST /api/messages/[userId]` - Send message

### Health Check
- `GET /api/health` - Application health status

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 📈 Performance

### Optimization Features
- **Image Optimization** - Automatic WebP/AVIF conversion
- **Code Splitting** - Automatic bundle optimization
- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Pre-built pages where possible
- **Database Indexing** - Optimized query performance

### Monitoring
- **Health Checks** - Application status monitoring
- **Error Logging** - Comprehensive error tracking
- **Performance Metrics** - Response time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent ORM
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

- **Documentation**: [Production Deployment Guide](./PRODUCTION-DEPLOYMENT.md)
- **Setup Guide**: [Setup Instructions](./SETUP-GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/Panda-0x01/Trenz/issues)

---

<div align="center">

**Built with ❤️ by the Trenz Team**

[⭐ Star this repo](https://github.com/Panda-0x01/Trenz) • [🐛 Report Bug](https://github.com/Panda-0x01/Trenz/issues) • [💡 Request Feature](https://github.com/Panda-0x01/Trenz/issues)

</div>