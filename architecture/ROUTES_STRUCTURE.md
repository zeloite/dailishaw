# Application Routes & Pages Structure

## Public Routes
- [x] `/login` - Login page for both Admin and User (COMPLETED)

## Admin Routes (`/dashboard`)
- [x] `/dashboard` - Admin Dashboard Home (COMPLETED)

### User Management
- [x] `/dashboard/users` - List all users (placeholder created)
- [ ] `/dashboard/users/create` - Create new user form
- [ ] `/dashboard/users/[id]` - View/Edit user details

### Media Management
- [ ] `/dashboard/categories` - List all product categories
- [ ] `/dashboard/categories/create` - Create new category
- [ ] `/dashboard/categories/[id]` - Edit category
- [ ] `/dashboard/products` - List all products
- [ ] `/dashboard/products/create` - Create new product
- [ ] `/dashboard/products/[id]` - Edit product & manage images

### Doctor Management
- [ ] `/dashboard/doctors` - List all doctors
- [ ] `/dashboard/doctors/create` - Create new doctor
- [ ] `/dashboard/doctors/[id]` - Edit doctor details

### Expense Monitoring
- [ ] `/dashboard/expenses` - View all user expenses with filters

### Settings
- [ ] `/dashboard/settings` - Admin settings & profile

## User Routes (`/user-dashboard`)
### Media Viewer
- [ ] `/user-dashboard/media` - Brand header with category selection
- [ ] `/user-dashboard/media/[categoryId]` - Product list for selected category
- [ ] `/user-dashboard/media/[categoryId]/[productId]` - Image slider for product

### Expense Management
- [ ] `/user-dashboard/expenses` - List user's own expenses
- [ ] `/user-dashboard/expenses/create` - Create new expense entry
- [ ] `/user-dashboard/expenses/[id]` - Edit expense entry

### Profile
- [ ] `/user-dashboard/profile` - User profile settings

## Route Protection
- Middleware checks authentication status
- Redirects based on user role (admin/user)
- Inactive users blocked from accessing any dashboard

## File Structure
```
app/
├── login/
│   ├── page.tsx ✅
│   └── actions.ts
├── (admin)/
│   ├── layout.tsx (with Sidebar)
│   ├── dashboard/
│   │   ├── page.tsx (Admin Dashboard Home)
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── doctors/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
├── (user)/
│   ├── layout.tsx (with User Navigation)
│   ├── user-dashboard/
│   │   ├── page.tsx (User Dashboard Home)
│   │   ├── media/
│   │   │   ├── page.tsx
│   │   │   ├── [categoryId]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [productId]/page.tsx
│   │   ├── expenses/
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── profile/
│   │       └── page.tsx
```

## Priority Order for Development
1. ✅ Login page (COMPLETED)
2. Admin Dashboard Home
3. Admin User Management (CRUD)
4. Admin Category Management (CRUD)
5. Admin Product Management (CRUD with image upload)
6. Admin Doctor Management (CRUD)
7. Admin Expense Monitoring (View only)
8. User Dashboard Home
9. User Media Viewer (Category → Product → Image Slider)
10. User Expense Management (CRUD own expenses)
11. Settings & Profile pages
