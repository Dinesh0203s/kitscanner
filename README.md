# Laptop Inventory Scanner

A full-stack Next.js 14 application for laptop barcode entry and inventory reporting with Neon PostgreSQL database.

## Features

- ✅ Dual barcode scanning (Serial Number + ELCOT Number)
- ✅ **Camera barcode scanner** - Scan barcodes using device camera
- ✅ **Physical barcode scanner** support - Works with USB/Bluetooth scanners
- ✅ Auto-focus workflow for fast data entry
- ✅ Duplicate detection with proper error messages
- ✅ Real-time search and filtering
- ✅ Pagination support
- ✅ Excel report generation
- ✅ **Admin panel** with authentication and delete functionality
- ✅ Production-ready with TypeScript
- ✅ Clean, responsive UI with Tailwind CSS
- ✅ Mobile-optimized for all pages

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Excel Export**: ExcelJS
- **Notifications**: React Hot Toast
- **Camera Scanning**: html5-qrcode

## Setup Instructions

### 1. Install Dependencies

```bash
cd laptop-inventory
npm install
```

### 2. Configure Neon Database

1. Create a free account at [Neon](https://console.neon.tech)
2. Create a new project
3. Copy your connection string
4. Create `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Usage

### Scanning Workflow

1. **Scan Page** (`/scan`):
   
   **Option A: Physical Barcode Scanner**
   - Scan Serial Number (auto-fills field)
   - Press Enter (auto-moves to ELCOT Number field)
   - Scan ELCOT Number (auto-fills field)
   - Press Enter (auto-saves entry)
   
   **Option B: Camera Scanner**
   - Click camera icon next to Serial Number field
   - Point camera at barcode
   - Auto-captures and fills Serial Number
   - Click camera icon next to ELCOT Number field
   - Point camera at barcode
   - Auto-captures, fills ELCOT Number, and auto-saves
   
   **Option C: Manual Entry**
   - Type Serial Number → Press Enter
   - Type ELCOT Number → Press Enter (auto-saves)
   
   - Success toast appears
   - Form resets for next entry

2. **List Page** (`/list`):
   - View all laptop entries
   - Search by serial or ELCOT number
   - Navigate through pages
   - Download Excel report

3. **Admin Panel** (`/admin`):
   - **Login Required**:
     - Username: `admin`
     - Password: `dinesh`
   - View all laptop entries
   - Search functionality
   - **Delete records** with confirmation
   - Logout option
   - Mobile-optimized interface

### API Endpoints

- `POST /api/laptops` - Create new laptop entry
- `GET /api/laptops?search=&page=1&limit=50` - List laptops with search and pagination
- `GET /api/laptops/export` - Download Excel report
- `DELETE /api/laptops/[id]` - Delete laptop entry (admin only)

## Database Schema

```prisma
model Laptop {
  id           String   @id @default(uuid())
  serialNumber String   @unique
  elcotNumber  String   @unique
  createdAt    DateTime @default(now())
}
```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - `DATABASE_URL`: Your Neon connection string
4. Deploy

### Environment Variables

```env
DATABASE_URL="postgresql://..."
```

## Project Structure

```
laptop-inventory/
├── app/
│   ├── api/
│   │   └── laptops/
│   │       ├── route.ts          # Create & list laptops
│   │       └── export/
│   │           └── route.ts      # Excel export
│   ├── scan/
│   │   └── page.tsx              # Scanning interface
│   ├── list/
│   │   └── page.tsx              # Inventory list
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home (redirects to scan)
├── lib/
│   └── prisma.ts                 # Prisma client
├── prisma/
│   └── schema.prisma             # Database schema
├── .env                          # Environment variables
└── package.json
```

## Features in Detail

### Duplicate Detection
- Unique constraints on both serial and ELCOT numbers
- Clear error messages indicating which field is duplicate
- Prevents data corruption

### Auto-Focus Workflow
- Serial Number field auto-focused on page load
- Enter key moves focus to ELCOT Number
- Enter key on ELCOT Number auto-submits
- Form resets and refocuses after successful save

### Excel Export
- Downloads all entries as .xlsx file
- Includes: Serial Number, ELCOT Number, Created At
- Formatted headers with styling
- Filename includes current date

### Search & Pagination
- Case-insensitive search
- Searches both serial and ELCOT numbers
- 50 entries per page (configurable)
- Total count and page navigation

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in `.env`
- Ensure Neon project is active
- Check connection string format includes `?sslmode=require`

### Migration Errors
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## License

MIT
