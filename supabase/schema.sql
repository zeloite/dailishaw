-- ============================================
-- TABLES
-- ============================================

-- This is for storing user profiles with roles and unique user IDs for non-admin users.
create table profiles (
  id uuid references auth.users on delete cascade,
  role text check (role in ('admin', 'user')) not null,
  user_id text unique, -- dailishaw_{name}, NULL for admin
  display_name text,
  is_active boolean default true,
  created_by uuid references auth.users,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  primary key (id)
);

-- This table stores product categories with metadata.
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  created_by uuid references auth.users,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- This table stores products linked to categories.
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references product_categories(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  created_by uuid references auth.users,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- This table stores images associated with products.
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  file_size bigint,
  mime_type text,
  sort_order integer default 0,
  created_by uuid references auth.users,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- This table stores doctor information.
create table doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  clinic text not null,
  specialty text,
  contact text,
  is_active boolean default true,
  created_by uuid references auth.users,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- This table stores expense records linked to users and doctors.
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  expense_date date not null check (expense_date <= CURRENT_DATE),
  doctor_id uuid references doctors(id),
  location text not null,
  amount numeric(10,2) not null check (amount > 0),
  fare_amount numeric(10,2) check (fare_amount >= 0),
  remarks text,
  created_by uuid references auth.users,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles indexes
create index idx_profiles_user_id on profiles(user_id);
create index idx_profiles_role on profiles(role);
create index idx_profiles_is_active on profiles(is_active);

-- Product categories indexes
create index idx_product_categories_is_active on product_categories(is_active);
create index idx_product_categories_sort_order on product_categories(sort_order);

-- Products indexes
create index idx_products_category_id on products(category_id);
create index idx_products_is_active on products(is_active);

-- Product images indexes
create index idx_product_images_product_id on product_images(product_id);
create index idx_product_images_sort_order on product_images(sort_order);

-- Doctors indexes
create index idx_doctors_is_active on doctors(is_active);

-- Expenses indexes
create index idx_expenses_user_id on expenses(user_id);
create index idx_expenses_doctor_id on expenses(doctor_id);
create index idx_expenses_date on expenses(expense_date);
create index idx_expenses_created_by on expenses(created_by);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table doctors enable row level security;
alter table expenses enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can insert profiles"
  on profiles for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update profiles"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Product categories policies
create policy "Anyone authenticated can view active categories"
  on product_categories for select
  using (is_active = true);

create policy "Admins can manage categories"
  on product_categories for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Products policies
create policy "Anyone authenticated can view active products"
  on products for select
  using (is_active = true);

create policy "Admins can manage products"
  on products for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Product images policies
create policy "Anyone authenticated can view product images"
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.is_active = true
    )
  );

create policy "Admins can manage product images"
  on product_images for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Doctors policies
create policy "Anyone authenticated can view active doctors"
  on doctors for select
  using (is_active = true);

create policy "Admins can manage doctors"
  on doctors for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Expenses policies
create policy "Users can view their own expenses"
  on expenses for select
  using (user_id = auth.uid());

create policy "Admins can view all expenses"
  on expenses for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Users can create their own expenses"
  on expenses for insert
  with check (user_id = auth.uid());

create policy "Users can update their own expenses"
  on expenses for update
  using (user_id = auth.uid());

create policy "Admins can manage all expenses"
  on expenses for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at to all tables
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_product_categories_updated_at
  before update on product_categories
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

create trigger update_product_images_updated_at
  before update on product_images
  for each row execute function update_updated_at_column();

create trigger update_doctors_updated_at
  before update on doctors
  for each row execute function update_updated_at_column();

create trigger update_expenses_updated_at
  before update on expenses
  for each row execute function update_updated_at_column();

-- Function to create profile after user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, user_id, created_by)
  values (new.id, 'user', null, new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for automatic profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add plain_password column to profiles table
ALTER TABLE profiles ADD COLUMN plain_password TEXT;

-- Update RLS policy to allow admins to read plain_password
-- (The existing admin policies should already cover this)