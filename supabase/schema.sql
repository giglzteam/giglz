-- profiles: auto-created on signup via trigger
create table if not exists profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  avatar_emoji       text default '😎',
  plan               text default 'free',
  stripe_customer_id text,
  created_at         timestamptz default now()
);

-- subscriptions: written by Stripe webhook only
create table if not exists subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) on delete cascade,
  stripe_sub_id        text unique,
  plan                 text,
  status               text,
  current_period_end   timestamptz,
  created_at           timestamptz default now()
);

-- game_sessions: nullable user_id for anonymous free games
create table if not exists game_sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete set null,
  players        jsonb,
  winner         text,
  cards_played   int,
  duration_secs  int,
  played_at      timestamptz default now()
);

-- Auto-create profile row on auth.users insert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Row Level Security
alter table profiles      enable row level security;
alter table subscriptions enable row level security;
alter table game_sessions enable row level security;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- subscriptions: service role key (webhook) bypasses RLS — no insert/update policy needed
create policy "Users read own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

-- game_sessions: authenticated users cannot spoof another user_id
create policy "Anyone can insert own game session"
  on game_sessions for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users read own sessions"
  on game_sessions for select using (auth.uid() = user_id);
