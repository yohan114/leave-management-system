# Leave Management System

A comprehensive, locally-hosted leave management system for tracking and managing employee leave requests. Built with Next.js 16, TypeScript, Prisma, and SQLite.

![Leave Management System](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite)

## ✨ Features

### User Management
- **Three User Roles**: Admin, Manager, Employee
- **Secure Authentication**: NextAuth.js with credentials provider
- **Role-based Access Control**: Different permissions for each role

### Leave Types
- Annual Leave
- Sick Leave
- Casual Leave
- Maternity/Paternity Leave
- Unpaid Leave
- Custom leave types (configurable by admin)

### Employee Features
- Submit leave requests with date range and reason
- View leave history
- Check leave balance
- Cancel pending requests
- Half-day leave support

### Manager Features
- View team members' leave requests
- Approve or reject requests with comments
- View team calendar
- Check team availability

### Admin Features
- Manage all users
- Create and edit departments
- Configure leave types
- View reports and analytics
- Override approvals/rejections

### Additional Features
- 📅 Visual team calendar with holidays
- 🔔 In-app notifications
- 📊 Leave balance tracking with visual indicators
- 📱 Responsive design (mobile-friendly)
- 🎨 Color-coded status indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/leave-management-system.git
   cd leave-management-system
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=file:./db/custom.db
   NEXTAUTH_SECRET=your-super-secret-key-change-in-production
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Initialize the database**
   ```bash
   bun run db:push
   bun prisma/seed.ts
   # or
   npx prisma db push
   npx ts-node prisma/seed.ts
   ```

5. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | password123 |
| Manager | manager.eng@company.com | password123 |
| Employee | employee1@company.com | password123 |

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Query
- **Date Handling**: date-fns

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data script
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   │   ├── auth/    # Authentication endpoints
│   │   │   ├── users/   # User management
│   │   │   ├── leave-requests/
│   │   │   ├── leave-balances/
│   │   │   ├── leave-types/
│   │   │   ├── departments/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   └── holidays/
│   │   ├── page.tsx     # Main application
│   │   └── layout.tsx   # Root layout
│   ├── components/ui/   # UI components (shadcn/ui)
│   ├── lib/
│   │   ├── auth.ts      # NextAuth configuration
│   │   └── db.ts        # Prisma client
│   └── hooks/           # React hooks
├── .env                 # Environment variables
└── package.json
```

## 📊 Database Schema

- **User**: Employee information with role and department
- **Department**: Organizational departments
- **LeaveType**: Leave categories with allocation rules
- **LeaveBalance**: Leave balance tracking per user/year/type
- **LeaveRequest**: Leave requests with approval workflow
- **Notification**: In-app notifications
- **Holiday**: Company holidays

## 🔒 Security Features

- Password hashing with bcrypt
- SQL injection prevention (Prisma)
- XSS protection
- Role-based access control
- Session-based authentication

## 📝 Scripts

```bash
bun run dev        # Start development server
bun run build      # Build for production
bun run lint       # Run ESLint
bun run db:push    # Push schema changes to database
bun run db:generate # Generate Prisma client
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://www.prisma.io/) for the amazing ORM
- [Next.js](https://nextjs.org/) for the React framework
