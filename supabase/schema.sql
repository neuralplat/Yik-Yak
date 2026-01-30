-- Enable PostGIS
create extension if not exists postgis;

-- 1. TABLES (Safe Create)
create table if not exists profiles ( id uuid references auth.users not null primary key, yakker_id text unique not null, karma int default 0, created_at timestamp with time zone default timezone('utc'::text, now()) not null, is_banned boolean default false );
create table if not exists communities ( id uuid default gen_random_uuid() primary key, creator_id uuid references profiles(id), name text not null, description text, location geography(Point) not null, radius_meters int default 5000 check (radius_meters <= 15000), created_at timestamp with time zone default timezone('utc'::text, now()) not null );
create table if not exists community_members ( community_id uuid references communities(id) on delete cascade not null, user_id uuid references profiles(id) not null, role text default 'member', joined_at timestamp with time zone default timezone('utc'::text, now()) not null, primary key (community_id, user_id) );
create table if not exists posts ( id uuid default gen_random_uuid() primary key, user_id uuid references profiles(id) not null, content text not null, location geography(Point) not null, upvotes int default 0, downvotes int default 0, score int default 0, created_at timestamp with time zone default timezone('utc'::text, now()) not null, expires_at timestamp with time zone, is_ghost boolean default false, community_id uuid references communities(id), check (char_length(content) <= 500) );
create table if not exists votes ( id uuid default gen_random_uuid() primary key, user_id uuid references profiles(id) not null, post_id uuid references posts(id) on delete cascade not null, value int not null check (value in (-1, 1)), created_at timestamp with time zone default timezone('utc'::text, now()) not null, unique(user_id, post_id) );
-- Updated Comments table with score columns
create table if not exists comments ( id uuid default gen_random_uuid() primary key, post_id uuid references posts(id) on delete cascade not null, user_id uuid references profiles(id) not null, content text not null, created_at timestamp with time zone default timezone('utc'::text, now()) not null, upvotes int default 0, downvotes int default 0, score int default 0 );
-- New Comment Votes table
create table if not exists comment_votes ( id uuid default gen_random_uuid() primary key, user_id uuid references profiles(id) not null, comment_id uuid references comments(id) on delete cascade not null, value int not null check (value in (-1, 1)), created_at timestamp with time zone default timezone('utc'::text, now()) not null, unique(user_id, comment_id) );

create table if not exists ads ( id uuid default gen_random_uuid() primary key, business_owner_id uuid references auth.users not null, content text not null, target_location geography(Point) not null, budget_remaining int default 0, status text default 'draft', created_at timestamp with time zone default timezone('utc'::text, now()) not null, expires_at timestamp with time zone, cost int );
create table if not exists reports ( id uuid default gen_random_uuid() primary key, reporter_id uuid references profiles(id), post_id uuid references posts(id), comment_id uuid references comments(id) on delete set null, reason text not null, status text default 'pending', created_at timestamp with time zone default timezone('utc'::text, now()) not null );

-- 2. ENABLE RLS
alter table profiles enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table posts enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table comment_votes enable row level security;
alter table ads enable row level security;
alter table reports enable row level security;

-- 3. DROP OLD POLICIES
drop policy if exists "Public posts are viewable by everyone" on posts;
drop policy if exists "Users can create posts" on posts;
drop policy if exists "Users can delete own posts" on posts;
drop policy if exists "Admins can delete any post" on posts;
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Anyone can read votes" on votes;
drop policy if exists "Users can vote" on votes;
drop policy if exists "Users can update own vote" on votes;
drop policy if exists "Users can delete own vote" on votes;
drop policy if exists "Anyone can read comments" on comments;
drop policy if exists "Users can comment" on comments;
drop policy if exists "Users can report" on reports;
drop policy if exists "Enable read access for all users" on reports;
drop policy if exists "Admins can update reports" on reports;
drop policy if exists "Public communities are viewable by everyone" on communities;
drop policy if exists "Users can create communities" on communities;
drop policy if exists "Anyone can read community members" on community_members;
drop policy if exists "Users can join communities" on community_members;
drop policy if exists "Users can leave communities" on community_members;
drop policy if exists "Users can view own ads" on ads;
drop policy if exists "Users can create ads" on ads;
drop policy if exists "Users can update own ads" on ads;

-- Comment Votes Policies
drop policy if exists "Anyone can read comment_votes" on comment_votes;
drop policy if exists "Users can vote on comments" on comment_votes;
drop policy if exists "Users can update own comment vote" on comment_votes;
drop policy if exists "Users can delete own comment vote" on comment_votes;


-- 4. CREATE NEW POLICIES
create policy "Public posts are viewable by everyone" on posts for select using (true);
create policy "Users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);
create policy "Admins can delete any post" on posts for delete using (true); 
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Anyone can read votes" on votes for select using (true);
create policy "Users can vote" on votes for insert with check (auth.uid() = user_id);
create policy "Users can update own vote" on votes for update using (auth.uid() = user_id);
create policy "Users can delete own vote" on votes for delete using (auth.uid() = user_id);
create policy "Anyone can read comments" on comments for select using (true);
create policy "Users can comment" on comments for insert with check (auth.uid() = user_id);
create policy "Admins can delete comments" on comments for delete using (true);
create policy "Users can report" on reports for insert with check (true);
create policy "Enable read access for all users" on reports for select using (true);
create policy "Admins can update reports" on reports for update using (true);
create policy "Public communities are viewable by everyone" on communities for select using (true);
create policy "Users can create communities" on communities for insert with check (auth.uid() = creator_id);
create policy "Anyone can read community members" on community_members for select using (true);
create policy "Users can join communities" on community_members for insert with check (auth.uid() = user_id);
create policy "Users can leave communities" on community_members for delete using (auth.uid() = user_id);
create policy "Users can view own ads" on ads for select using (auth.uid() = business_owner_id);
create policy "Users can create ads" on ads for insert with check (auth.uid() = business_owner_id);
create policy "Users can update own ads" on ads for update using (auth.uid() = business_owner_id);

-- Comment Votes
create policy "Anyone can read comment_votes" on comment_votes for select using (true);
create policy "Users can vote on comments" on comment_votes for insert with check (auth.uid() = user_id);
create policy "Users can update own comment vote" on comment_votes for update using (auth.uid() = user_id);
create policy "Users can delete own comment vote" on comment_votes for delete using (auth.uid() = user_id);

-- 5. TRIGGERS

-- Posts Score
create or replace function update_post_score() returns trigger as $$
begin
  update posts
  set score = (select coalesce(sum(value), 0) from votes where post_id = coalesce(new.post_id, old.post_id))
  where id = coalesce(new.post_id, old.post_id);
  return new;
end;
$$ language plpgsql;
drop trigger if exists on_vote_update on votes;
create trigger on_vote_update after insert or update or delete on votes for each row execute function update_post_score();

-- Comments Score
create or replace function update_comment_score() returns trigger as $$
begin
  update comments
  set score = (select coalesce(sum(value), 0) from comment_votes where comment_id = coalesce(new.comment_id, old.comment_id))
  where id = coalesce(new.comment_id, old.comment_id);
  return new;
end;
$$ language plpgsql;
drop trigger if exists on_comment_vote_update on comment_votes;
create trigger on_comment_vote_update after insert or update or delete on comment_votes for each row execute function update_comment_score();
