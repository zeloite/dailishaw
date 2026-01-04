# Migration Instructions

## Add doctor_name Column to Expenses Table

To enable manual doctor name entry in the expense management system, you need to add a new column to the `expenses` table.

### Option 1: Using Supabase Dashboard (SQL Editor)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Create a new query and paste the following SQL:

```sql
-- Add doctor_name field to expenses table for manually entered doctor names
ALTER TABLE expenses ADD COLUMN doctor_name text;

-- Add comment explaining the column
COMMENT ON COLUMN expenses.doctor_name IS 'Manual doctor name when not selecting from doctors table';
```

4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Apply the migration
supabase db push
```

The migration file is located at:
`supabase/migrations/add_doctor_name_to_expenses.sql`

---

## What Changed

The expense management system now supports two ways to enter doctor information:

1. **Select from list** - Choose from existing doctors in the database
2. **Enter manually** - Type in a doctor name directly (saved in `doctor_name` field)

When displaying expenses, the system will show:
- Doctor's name and clinic (if selected from list)
- Manually entered doctor name (if entered manually)
- "-" if no doctor information provided
