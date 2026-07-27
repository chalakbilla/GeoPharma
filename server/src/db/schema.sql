create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id serial primary key,
  user_id integer references users(id) on delete set null,
  extracted_text text,
  diseases jsonb,
  created_at timestamptz not null default now()
);
