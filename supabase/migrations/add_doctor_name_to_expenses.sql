-- Add doctor_name field to expenses table for manually entered doctor names
alter table expenses add column doctor_name text;

-- Add comment explaining the column
comment on column expenses.doctor_name is 'Manual doctor name when not selecting from doctors table';
