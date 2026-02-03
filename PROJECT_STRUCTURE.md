# Project Structure

## Overview

```
laptop-inventory/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   └── laptops/
│   │       ├── route.ts          # POST (create) & GET (list) laptops
│   │       └── export/
│   │           └── route.ts      # GET Excel export
│   ├── scan/
│   │   └── page.tsx              # Barcode scanning interface
│   ├── list/
│   │   └── page.tsx              # Inventory list & search
│   ├── layout.tsx                # Root layout with Toaster
│   ├── page.tsx                  # Home (redirects to /scan)
│   └── globals.css               # Global styles
├── lib/
│   └── prisma.ts                 # Prisma client singleton
├── prisma/
│   └── schema.prisma             # Database schema
├── .env                          # Environment variables (not in git)
├── .env.example                  # Example env file
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── next.config.ts                # Next.js config
├── setup.bat                     # Windows setup script
├── QUICKSTART.md                 # 5-minute setup guide
├── SETUP.md                      # Detailed setup instructions
├── DEPLOYMENT.md                 # Production deployment guide
└── README.md                     # Main documentation
```

---

## File Descriptions

### Core Application Files

#### `app/layout.tsx`
- Root layout component
- Configures fonts (Inter)
- Includes React Hot Toast for notifications
- Sets metadata (title, description)

#### `app/page.tsx`
- Home page
- Redirects to `/scan` on load
- Entry point for the application

#### `app/globals.css`
- Global CSS styles
- Tailwind CSS directives
- Custom utility classes

---

### Feature Pages

#### `app/scan/page.tsx`
**Purpose**: Barcode scanning interface

**Features**:
- Two input fields (serial number, ELCOT number)
- Auto-focus workflow
- Enter key navigation
- Auto-submit on second Enter
- Form validation
- Success/error toasts
- Duplicate detection

**State Management**:
- `serialNumber`: First barcode input
- `elcotNumber`: Second barcode input
- `isSubmitting`: Loading state during save

**User Flow**:
1. Page loads → Serial input focused
2. User scans/types serial → Press Enter
3. Focus moves to ELCOT input
4. User scans/types ELCOT → Press Enter
5. Auto-submits to API
6. Shows success toast
7. Form resets, focus returns to serial input

#### `app/list/page.tsx`
**Purpose**: View and manage inventory

**Features**:
- Display all laptop entries
- Real-time search (serial or ELCOT)
- Pagination (50 entries per page)
- Excel export button
- Navigate to scan page

**State Management**:
- `laptops`: Array of laptop entries
- `search`: Search query
- `pagination`: Page info (current, total, limit)
- `isLoading`: Loading state
- `isExporting`: Excel export state

**API Integration**:
- Fetches from `GET /api/laptops`
- Supports search and pagination params
- Downloads from `GET /api/laptops/export`

---

### API Routes

#### `app/api/laptops/route.ts`

**POST /api/laptops**
- Creates new laptop entry
- Validates required fields
- Handles duplicate detection (Prisma P2002 error)
- Returns 201 on success, 409 on duplicate, 400 on validation error

**Request Body**:
```json
{
  "serialNumber": "string",
  "elcotNumber": "string"
}
```

**Response (Success)**:
```json
{
  "id": "uuid",
  "serialNumber": "string",
  "elcotNumber": "string",
  "createdAt": "datetime"
}
```

**Response (Error)**:
```json
{
  "error": "This serial number already exists"
}
```

**GET /api/laptops**
- Lists laptop entries
- Supports search (case-insensitive)
- Supports pagination
- Returns entries with pagination metadata

**Query Parameters**:
- `search`: Search term (optional)
- `page`: Page number (default: 1)
- `limit`: Entries per page (default: 50)

**Response**:
```json
{
  "laptops": [
    {
      "id": "uuid",
      "serialNumber": "string",
      "elcotNumber": "string",
      "createdAt": "datetime"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

#### `app/api/laptops/export/route.ts`

**GET /api/laptops/export**
- Generates Excel file with all entries
- Uses ExcelJS library
- Formats headers with styling
- Returns .xlsx file as download

**Response**:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Filename: `laptop-inventory-YYYY-MM-DD.xlsx`

**Excel Columns**:
1. Serial Number
2. ELCOT Number
3. Created At (formatted as locale string)

---

### Database Layer

#### `lib/prisma.ts`
**Purpose**: Prisma client singleton

**Why Singleton?**
- Prevents multiple Prisma instances in development
- Reuses connection pool
- Improves performance

**Implementation**:
- Creates single Prisma instance
- Stores in global scope (dev only)
- Exports for use in API routes

#### `prisma/schema.prisma`
**Purpose**: Database schema definition

**Model: Laptop**
```prisma
model Laptop {
  id           String   @id @default(uuid())
  serialNumber String   @unique
  elcotNumber  String   @unique
  createdAt    DateTime @default(now())

  @@index([serialNumber])
  @@index([elcotNumber])
}
```

**Fields**:
- `id`: UUID primary key
- `serialNumber`: Unique identifier (indexed)
- `elcotNumber`: Unique identifier (indexed)
- `createdAt`: Auto-generated timestamp

**Constraints**:
- Both serial and ELCOT must be unique
- Indexes for fast search queries

---

## Configuration Files

### `package.json`
**Scripts**:
- `dev`: Start development server
- `build`: Generate Prisma Client + build Next.js
- `start`: Start production server
- `postinstall`: Auto-generate Prisma Client
- `db:migrate`: Run database migrations
- `db:push`: Push schema changes
- `db:studio`: Open Prisma Studio

**Dependencies**:
- `next`: Framework
- `react`, `react-dom`: UI library
- `@prisma/client`: Database client
- `prisma`: Database toolkit
- `exceljs`: Excel generation
- `react-hot-toast`: Notifications

**Dev Dependencies**:
- `typescript`: Type safety
- `tailwindcss`: Styling
- `@types/*`: TypeScript definitions
- `eslint`: Code linting

### `tsconfig.json`
- Strict TypeScript configuration
- Path aliases (`@/*` → root)
- Next.js optimizations

### `tailwind.config.ts`
- Tailwind CSS configuration
- Content paths for purging
- Custom theme (if any)

### `next.config.ts`
- Next.js configuration
- Build optimizations
- Environment variables

---

## Environment Files

### `.env` (Not in Git)
**Required Variables**:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

**Security**:
- Never commit to git
- Listed in `.gitignore`
- Use `.env.example` as template

### `.env.example`
- Template for `.env`
- Shows required format
- Safe to commit to git

---

## Documentation Files

### `README.md`
- Main project documentation
- Feature overview
- Tech stack
- Usage instructions
- API documentation
- Project structure

### `QUICKSTART.md`
- 5-minute setup guide
- Minimal steps to get running
- Quick troubleshooting
- Command reference

### `SETUP.md`
- Detailed setup instructions
- Neon database configuration
- Environment setup
- Migration guide
- Troubleshooting
- Development tips

### `DEPLOYMENT.md`
- Production deployment guide
- Vercel deployment (recommended)
- Alternative platforms
- Environment variables
- Post-deployment checklist
- Monitoring & maintenance
- Scaling considerations
- Backup strategy

### `PROJECT_STRUCTURE.md` (This File)
- Complete project structure
- File descriptions
- Architecture overview
- Code organization

---

## Data Flow

### Scanning Workflow

```
User Scans Barcode
       ↓
Input Field (scan/page.tsx)
       ↓
Enter Key → Focus Next Field
       ↓
Second Barcode Scanned
       ↓
Enter Key → Submit Form
       ↓
POST /api/laptops (api/laptops/route.ts)
       ↓
Prisma Client (lib/prisma.ts)
       ↓
Neon PostgreSQL Database
       ↓
Response → Success Toast
       ↓
Form Reset → Ready for Next Entry
```

### List & Search Workflow

```
User Opens List Page
       ↓
GET /api/laptops (list/page.tsx)
       ↓
Prisma Query (api/laptops/route.ts)
       ↓
Neon PostgreSQL Database
       ↓
Response → Display Table
       ↓
User Types Search Query
       ↓
Debounced API Call
       ↓
Filtered Results Displayed
```

### Excel Export Workflow

```
User Clicks "Download Excel"
       ↓
GET /api/laptops/export (list/page.tsx)
       ↓
Fetch All Entries (api/laptops/export/route.ts)
       ↓
Generate Excel with ExcelJS
       ↓
Stream File to Browser
       ↓
Browser Downloads File
```

---

## Key Design Decisions

### Why Next.js 14 App Router?
- Server Components for better performance
- Built-in API routes
- File-based routing
- Excellent TypeScript support
- Easy deployment

### Why Prisma?
- Type-safe database queries
- Auto-generated types
- Migration management
- Excellent DX (Developer Experience)
- Works great with Neon

### Why Neon?
- Serverless PostgreSQL
- Generous free tier
- Auto-scaling
- Built-in backups
- Fast cold starts

### Why Tailwind CSS?
- Utility-first approach
- Fast development
- Small bundle size
- Responsive design
- Easy customization

### Why ExcelJS?
- Pure JavaScript (no native dependencies)
- Works in serverless environments
- Rich formatting options
- Reliable and maintained

---

## Security Considerations

### Input Validation
- Required field validation
- Trim whitespace
- Prevent empty submissions

### Database Security
- Unique constraints prevent duplicates
- Indexed fields for performance
- SSL required for connections
- Environment variables for credentials

### API Security
- Proper error handling
- No sensitive data in responses
- HTTP status codes
- CORS handled by Next.js

### Client Security
- No sensitive data in client code
- Toast notifications for user feedback
- Loading states prevent double submissions

---

## Performance Optimizations

### Database
- Indexes on searchable fields
- Connection pooling (Prisma)
- Efficient queries (select only needed fields)

### Frontend
- React Server Components
- Optimistic UI updates
- Debounced search
- Pagination for large datasets

### API
- Efficient Prisma queries
- Proper HTTP caching headers
- Streaming for Excel exports

---

## Testing Strategy (Future Enhancement)

### Unit Tests
- API route handlers
- Utility functions
- Validation logic

### Integration Tests
- Database operations
- API endpoints
- Excel generation

### E2E Tests
- Scanning workflow
- Search functionality
- Excel export

**Recommended Tools**:
- Jest for unit tests
- Playwright for E2E tests
- Prisma test database

---

## Future Enhancements

### Features
- [ ] Bulk import from Excel
- [ ] Edit/delete entries
- [ ] User authentication
- [ ] Audit logs
- [ ] Advanced filtering
- [ ] Dashboard with statistics
- [ ] QR code generation
- [ ] Mobile app

### Technical
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Real-time updates (WebSockets)
- [ ] Automated tests
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry)
- [ ] Analytics

---

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review database performance
- Monitor error logs
- Backup database weekly
- Review security advisories

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update Prisma
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

### Database Maintenance
```bash
# View database in browser
npx prisma studio

# Create backup
pg_dump $DATABASE_URL > backup.sql

# Optimize (if needed)
# Run VACUUM in Neon console
```

---

This structure provides a solid foundation for a production-ready laptop inventory system with room for future enhancements.
