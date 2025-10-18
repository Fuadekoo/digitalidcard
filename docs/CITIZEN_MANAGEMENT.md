# Citizen Management System Documentation

## Overview

Comprehensive citizen management system for Station Admins with verification, viewing, and deletion capabilities.

## Features Implemented

### Backend (`actions/stationAdmin/citizen.ts`)

#### ✅ `getCitizens()`

- **Functionality**: Fetch citizens with advanced filtering and pagination
- **Features**:
  - Station-scoped queries (only shows citizens from admin's station)
  - Search by: first name, last name, middle name, phone, registration number
  - Case-insensitive search
  - Pagination support
  - Sorting by creation date
  - Includes station and order information
  - Returns total count and total pages for pagination
- **Error Handling**: Comprehensive try-catch with authentication checks

#### ✅ `getSingleCitizen()`

- **Functionality**: Fetch detailed information for a single citizen
- **Features**:
  - Authentication check
  - Includes station details
  - Includes all order information
- **Error Handling**: Returns error if citizen not found

#### ✅ `verifyCitizen()`

- **Functionality**: Mark a citizen as verified
- **Features**:
  - Sets `isVerified` to `true`
  - Revalidates page cache
  - Returns success/failure status with message
- **Error Handling**: Returns status object with error message

#### ✅ `unVerifyCitizen()`

- **Functionality**: Remove verification status from a citizen
- **Features**:
  - Sets `isVerified` to `false`
  - Revalidates page cache
  - Returns success/failure status with message
- **Error Handling**: Returns status object with error message

#### ✅ `deleteCitizen()`

- **Functionality**: Delete a citizen record
- **Features**:
  - Safety check: prevents deletion if citizen has orders
  - Authentication verification
  - Revalidates page cache after deletion
  - Returns detailed error messages
- **Error Handling**:
  - Checks if citizen exists
  - Prevents deletion if orders exist
  - Returns user-friendly error messages

### Frontend UI (`features/citizen/components/citizen-management-ui.tsx`)

#### 📊 Statistics Dashboard

- **Total Citizens**: Shows count of all citizens in station
- **Verified Citizens**: Count of verified citizens
- **Pending Verification**: Count of citizens awaiting verification
- **Color-coded cards** with icons for visual clarity

#### 🔍 Search & Filter

- **Real-time search** across multiple fields:
  - First name, middle name, last name
  - Phone number
  - Registration number
- **Search results counter**: Shows "X of Y citizens"
- **URL-based search**: Search persists across page refreshes

#### 📋 Citizens Table

- **Columns**:
  - Registration Number (always visible)
  - Full Name (always visible)
  - Gender (hidden on mobile)
  - Phone (hidden on small screens)
  - Verification Status (always visible)
  - Actions (always visible)
- **Responsive design**: Hides less critical columns on smaller screens
- **Hover effects**: Row highlighting on hover

#### 🎨 Visual Indicators

- **Gender badges**: Color-coded (Blue for Male, Pink for Female, Purple for Other)
- **Verification status badges**:
  - ✅ Green with shield icon for verified
  - ⚠️ Orange with shield-x icon for pending

#### ⚡ Actions

1. **View Details** (Eye icon)
   - Opens detailed modal with all citizen information
   - Shows: Registration #, Full Name, Gender, Phone, DOB, Place of Birth, Occupation
   - Displays verification status
2. **Verify/Unverify** (Check/X icon)
   - Toggle button that changes based on current status
   - Green for verify action
   - Orange for unverify action
   - Instant feedback with toast notifications
3. **Delete** (Trash icon)
   - Red color indicator
   - Shows confirmation dialog
   - Warns if citizen has existing orders
   - Prevents deletion if orders exist

#### 📄 Pagination

- **Page counter**: "Page X of Y"
- **Navigation buttons**: Previous/Next
- **Disabled states**: Prevents clicking beyond page boundaries
- **URL-based**: Page state persists in URL

#### 🎭 Dialogs

**View Citizen Dialog**:

- Two-column layout on larger screens
- Icon indicators for contact info, location, occupation
- Clean, readable design
- Close button

**Delete Confirmation Dialog**:

- Warning message with citizen name
- Special alert if citizen has orders
- Cancel/Delete buttons
- Red theme for danger indication

#### 🎨 Design Features

- **Gradient backgrounds**: Blue to green gradient
- **Smooth animations**: Hover effects and transitions
- **Responsive layout**: Works on mobile, tablet, and desktop
- **Loading states**: Handles pending states during actions
- **Toast notifications**: Success/error feedback for all actions
- **Empty state**: Friendly message when no citizens found

### Page Component (`app/[lang]/dashboard/@stationAdmin/citizenManagement/page.tsx`)

#### Server-Side Rendering

- Fetches data on the server
- Handles search params
- Default pagination settings (10 rows per page)
- Sorts by newest first

## Usage

### Accessing the Page

Navigate to: `/en/dashboard/citizenManagement`

### Search

1. Type in the search box
2. Search applies to: name (all parts), phone, registration number
3. Results update automatically

### Verify a Citizen

1. Find the citizen in the table
2. Click the check mark icon (if unverified)
3. Success toast appears
4. Status badge updates to "Verified"

### Unverify a Citizen

1. Find the verified citizen
2. Click the X icon
3. Confirmation toast appears
4. Status badge updates to "Pending"

### View Citizen Details

1. Click the eye icon
2. Modal opens with full details
3. Click "Close" to dismiss

### Delete a Citizen

1. Click the trash icon
2. Confirmation dialog appears
3. Review the warning (especially if they have orders)
4. Click "Delete" to confirm or "Cancel" to abort
5. If citizen has orders, deletion will fail with error message

## Security Features

- ✅ Authentication required for all actions
- ✅ Station-scoped data (admins only see their station's citizens)
- ✅ Prevents deletion of citizens with orders
- ✅ Server-side validation
- ✅ Error handling on all operations

## Performance Features

- ✅ Pagination (reduces data load)
- ✅ Server-side rendering (fast initial load)
- ✅ Optimistic UI updates
- ✅ Page revalidation after mutations
- ✅ Efficient database queries with proper indexes

## Error Messages

- "Failed to fetch citizens" - Database or auth error
- "Citizen not found" - Invalid citizen ID
- "Cannot delete citizen with existing orders" - Safety check
- "Failed to verify/unverify citizen" - Database error
- Custom toast notifications for user feedback

## Future Enhancements (Optional)

- [ ] Export citizens to CSV/Excel
- [ ] Bulk verify/unverify
- [ ] Advanced filters (by gender, verification status, date range)
- [ ] Citizen profile images in table
- [ ] Edit citizen information
- [ ] Activity log for citizen changes

## Dependencies

- Prisma (Database ORM)
- Next.js App Router
- Sonner (Toast notifications)
- Lucide React (Icons)
- Tailwind CSS (Styling)
- Shadcn/UI Components

## Notes

- All dates are formatted in "MMM DD, YYYY" format
- Gender values match Prisma enum: MALE, FEMALE, OTHER
- Phone numbers are stored and displayed as-is (no formatting)
- Registration numbers are displayed in monospace font for clarity
