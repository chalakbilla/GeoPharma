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

-- full structured analysis (patient, doctor, medicines, interactions...) used by "My prescriptions"
alter table prescriptions add column if not exists result jsonb;

create index if not exists prescriptions_user_created_idx on prescriptions (user_id, created_at desc);
