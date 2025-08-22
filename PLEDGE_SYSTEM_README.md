# The Good Loose Coins - Pledge Management System

## Overview

This document provides comprehensive documentation for the pledge management system implemented for The Good Loose Coins project. The system enables donors to create pledges and complete a 3-task workflow, while donees can track available funds and tasks.

## 🏗️ System Architecture

### Core Components

1. **API Routes** (`/src/app/api/pledges/`)
   - `POST /api/pledges` - Create new pledge
   - `GET /api/pledges` - List pledges with filters/pagination
   - `PATCH /api/pledges/[id]` - Update pledge status
   - `GET /api/pledges/[id]/tasks` - Get pledge tasks and progress
   - `GET /api/pledges/stats` - Dashboard statistics
   - `GET /api/social-impact/leaderboard` - Impact leaderboard

2. **React Components** (`/src/components/`)
   - `PledgeCreationForm` - Multi-step pledge creation
   - `PledgeStatusCard` - Task completion interface
   - `PledgesList` - List and filter pledges
   - `Leaderboard` - Social impact points ranking
   - `ErrorBoundary` - Error handling
   - `Toast` - User notifications

3. **Type Definitions** (`/src/types/pledge.ts`)
   - Comprehensive TypeScript interfaces
   - Validation constants and rules
   - API response types

4. **Utilities** (`/src/lib/`)
   - `coins.ts` - Coin calculation helpers
   - `validation.ts` - Input validation and error handling

## 🔄 Pledge Workflow

### 3-Task System

1. **Task 1: Pledge Creation** (Automatic)
   - Completed when donor creates pledge
   - Awards 10 base points + 5 task points
   - Status: `PENDING` → `TASK1_COMPLETE`

2. **Task 2: Exchange Coins** (Manual)
   - Donor exchanges coins at participating stores
   - Requires photo evidence or description
   - Awards 15 points
   - Status: `TASK1_COMPLETE` → `TASK2_COMPLETE`

3. **Task 3: Transfer Confirmation** (Manual)
   - Confirm transfer of exchanged amount
   - Requires receipt or confirmation
   - Awards 20 points
   - Status: `TASK2_COMPLETE` → `COMPLETED`

### Status Transitions

```
PENDING → TASK1_COMPLETE → TASK2_COMPLETE → COMPLETED
```

Only forward transitions are allowed, preventing status rollbacks.

## 💰 Points System

### Base Points
- **Pledge Creation**: 10 points
- **Task 1 Completion**: 5 points (automatic)
- **Task 2 Completion**: 15 points (coin exchange)
- **Task 3 Completion**: 20 points (transfer confirmation)

### Bonus Points (Amount-based)
- **Small Pledges** ($5.00 - $24.99): +5 points
- **Medium Pledges** ($25.00 - $99.99): +15 points
- **Large Pledges** ($100.00+): +50 points

### Total Possible Points
- Minimum: 50 points (base + small bonus)
- Maximum: 100 points (base + large bonus)

## 📊 API Endpoints

### Create Pledge
```http
POST /api/pledges
Content-Type: application/json

{
  "amount": 25.75
}
```

### Update Pledge Status
```http
PATCH /api/pledges/{id}
Content-Type: application/json

{
  "status": "TASK2_COMPLETE",
  "taskEvidence": {
    "type": "photo",
    "description": "Exchanged coins at local grocery store"
  }
}
```

### Get Pledges with Filters
```http
GET /api/pledges?status=TASK1_COMPLETE&minAmount=10&sortBy=createdAt&sortOrder=desc&page=1&limit=10
```

### Get Dashboard Statistics
```http
GET /api/pledges/stats
```

Returns different stats based on user type:
- **Donors**: totalPledged, activePledges, completedPledges, totalPoints, peopleHelped
- **Donees**: availableFunds, activeTasks, completedTasks, pendingRewards, totalEarned

## 🧩 React Components Usage

### PledgeCreationForm
```tsx
import PledgeCreationForm from '@/components/pledges/PledgeCreationForm';

<PledgeCreationForm
  onSuccess={(pledge) => console.log('Created:', pledge)}
  onCancel={() => setShowForm(false)}
/>
```

### PledgesList
```tsx
import PledgesList from '@/components/pledges/PledgesList';

<PledgesList
  userType="DONOR"
  onPledgeUpdate={(pledge) => console.log('Updated:', pledge)}
/>
```

### Leaderboard
```tsx
import Leaderboard from '@/components/social-impact/Leaderboard';

<Leaderboard
  currentUserId={user.id}
  limit={10}
  className="custom-styles"
/>
```

## 🛡️ Security & Validation

### Input Validation
- Amount validation (min $0.50, max $1000.00)
- Coin count validation (max 1000 per type)
- Evidence description validation (max 500 chars)
- File upload validation (5MB max, image types only)

### Authorization
- Users can only create/update their own pledges
- Donees can view pledges with donations for them
- Proper authentication checks on all endpoints

### Data Sanitization
- User input sanitization
- SQL injection prevention via Prisma ORM
- XSS prevention in React components

## 📱 User Experience Features

### Multi-step Form
- Progressive disclosure of complexity
- Real-time validation feedback
- Coin counting calculator
- Amount confirmation step

### Task Management
- Visual progress indicators
- Task status tracking
- Evidence submission forms
- Point calculation display

### Error Handling
- Comprehensive error boundaries
- Toast notification system
- Graceful degradation
- Detailed error messages

## 🗄️ Database Schema

### Pledge Model
```sql
model Pledge {
  id        String        @id @default(cuid())
  donorId   String        @map("donor_id")
  amount    Float
  status    PledgeStatus  @default(PENDING)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  
  donor     User          @relation("DonorPledges", fields: [donorId], references: [id])
  donations Donation[]
}
```

### Status Enum
```sql
enum PledgeStatus {
  PENDING
  TASK1_COMPLETE
  TASK2_COMPLETE
  COMPLETED
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account
- Prisma CLI

### Installation
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations: `npm run db:migrate`
4. Start development server: `npm run dev`

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

## 📋 Testing

### Manual Testing Checklist
- [ ] Create pledge with various amounts
- [ ] Test coin calculator accuracy
- [ ] Complete Task 2 with evidence
- [ ] Complete Task 3 with confirmation
- [ ] Verify point calculations
- [ ] Test status transitions
- [ ] Check donor dashboard stats
- [ ] Verify donee dashboard updates
- [ ] Test leaderboard functionality
- [ ] Validate error handling

### API Testing
Use the provided API endpoints with tools like Postman or curl to test:
- Authentication flows
- Pledge creation
- Status updates
- Statistics retrieval
- Error scenarios

## 🔮 Future Enhancements

### Planned Features
1. **Photo Upload**: Real image upload for task evidence
2. **Push Notifications**: Real-time updates for users
3. **Matching Algorithm**: Improved donor-donee matching
4. **Payment Integration**: Direct payment processing
5. **Mobile App**: React Native implementation
6. **Advanced Analytics**: Detailed impact tracking

### Technical Improvements
1. **Caching**: Redis integration for better performance
2. **Background Jobs**: Queue system for async processing
3. **Rate Limiting**: API request throttling
4. **Monitoring**: Error tracking and performance metrics
5. **Testing**: Automated test suite
6. **Documentation**: Interactive API documentation

## 🐛 Troubleshooting

### Common Issues

1. **Pledge Creation Fails**
   - Check amount validation (min $0.50)
   - Verify user authentication
   - Ensure database connection

2. **Task Update Errors**
   - Verify status transition rules
   - Check evidence requirements
   - Validate user permissions

3. **Stats Not Loading**
   - Check API endpoint availability
   - Verify database queries
   - Review authentication status

### Debug Tools
- Browser dev tools for client-side issues
- Server logs for API errors
- Prisma Studio for database inspection
- Network tab for API request debugging

## 📞 Support

For technical support or questions about the pledge management system:

1. Check this documentation first
2. Review the code comments and TypeScript types
3. Test with the provided API examples
4. Use browser dev tools to debug client-side issues

## 🏆 Success Metrics

The system tracks several key metrics:
- Pledge creation rate
- Task completion rate
- Average pledge amount
- User engagement (points earned)
- Social impact (people helped)

Monitor these metrics through the dashboard statistics API and leaderboard functionality.