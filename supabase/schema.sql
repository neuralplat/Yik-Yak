-- Enable PostGIS for location features
create extension if not exists postgis;

-- 1. PROFILES (Publicly accessible user data, linked to Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  yakker_id text unique not null, -- Randomly generated public ID
  karma int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_banned boolean default false
);

-- 2. COMMUNITIES (Location-based "Herds")
create table communities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  location geography(Point) not null,
  radius_meters int default 5000, -- Default radius for the community
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. POSTS (The core content)
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  content text not null,
  location geography(Point) not null, -- Precise location of the post
  upvotes int default 0,
  downvotes int default 0,
  score int default 0, -- Computed (up - down)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone, -- For Ghost Posts
  is_ghost boolean default false,
  community_id uuid references communities(id), -- Optional: if posted in a specific community
  
  -- Constraint to ensure content passes moderation (handled by app logic, but good to have)
  check (char_length(content) <= 500)
);

-- 4. VOTES (Prevent duplicate voting)
create table votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  post_id uuid references posts(id) on delete cascade not null,
  value int not null check (value in (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- 5. COMMENTS
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ADS (Business feature)
create table ads (
  id uuid default gen_random_uuid() primary key,
  business_owner_id uuid references auth.users not null, -- Link to the paying user
  content text not null,
  target_location geography(Point) not null,
  target_radius_meters int default 10000, -- 10km default
  budget_remaining int default 0, -- Could be impressions or currency
  status text check (status in ('draft', 'active', 'paused', 'completed')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REPORTS (Moderation)
create table reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references profiles(id), -- Can be null if we allow anonymous reporting without account? Better to track.
  post_id uuid references posts(id),
  reason text not null,
  status text check (status in ('pending', 'reviewed', 'dismissed', 'action_taken')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Preliminary Security)
alter table profiles enable row level security;
alter table posts enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table ads enable row level security;

-- Public read access for posts (filtered by location/validity in query usually)
create policy "Public posts are viewable by everyone"
  on posts for select
  using (true);

-- Users can create posts
create policy "Users can create posts"
  on posts for insert
  with check (auth.uid() = user_id);
