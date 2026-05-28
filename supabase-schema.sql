-- =============================================
-- サンフラワープロジェクト Supabase スキーマ
-- セキュリティ: RLS (Row Level Security) で
-- 全テーブルを本人のみアクセス可能に制限
-- =============================================

-- ===== profiles テーブル =====
-- Supabase Auth の auth.users と 1:1 で紐づく
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS有効化
alter table public.profiles enable row level security;

-- ポリシー: 本人のプロフィールのみ読み取り可能
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- ポリシー: 本人のプロフィールのみ更新可能
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ポリシー: 新規登録時にプロフィール作成（本人のみ）
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ユーザー登録時に自動でprofilesレコードを作成するトリガー
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ===== stamps テーブル =====
create table public.stamps (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,           -- 'seed','water','bloom','harvest','photo','home'
  year int not null default 2026,
  photo_path text,              -- Storage内のファイルパス（本人のみアクセス可）
  acquired_at timestamptz not null default now(),
  -- NFT関連（サーバーサイドで設定）
  nft_token_id int,
  nft_tx_hash text,

  -- 同一ユーザー・同一タイプ・同一年度で1回のみ（DB制約で強制）
  unique(user_id, type, year)
);

-- RLS有効化
alter table public.stamps enable row level security;

-- ポリシー: 本人のスタンプのみ読み取り可能
create policy "stamps_select_own"
  on public.stamps for select
  using (auth.uid() = user_id);

-- ポリシー: スタンプの直接INSERT/UPDATE/DELETEはブラウザから禁止
-- スタンプ登録はサーバーサイドAPIルート（service_roleキー）経由でのみ実行
-- → ブラウザのanonキーではINSERTできない = 不正取得防止


-- ===== active_events テーブル =====
-- サーバーサイドでスタンプ取得可否を判定するための設定
create table public.active_events (
  id uuid not null default gen_random_uuid() primary key,
  stamp_type text not null,       -- 'seed','water','bloom','harvest','photo','home'
  year int not null default 2026,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  requires_gps boolean not null default false,
  is_active boolean not null default true
);

-- RLS有効化（読み取りは全員可、書き込みは管理者のみ）
alter table public.active_events enable row level security;

create policy "events_select_all"
  on public.active_events for select
  using (true);
-- INSERT/UPDATE/DELETEポリシーなし → ブラウザからは変更不可
-- 管理はSupabaseダッシュボードまたはservice_roleキーで行う


-- ===== 参加統計ビュー =====
-- 個人情報を含まない集計のみ公開
create or replace view public.stamp_stats as
select
  type,
  year,
  count(distinct user_id) as participant_count,
  count(*) as stamp_count
from public.stamps
group by type, year;

-- ビューは全員閲覧可能（個人情報は含まない）


-- ===== Storage バケット =====
-- Supabaseダッシュボードで以下を設定:
--
-- 1. バケット「photos」を作成（Private）
--
-- 2. 以下のRLSポリシーを設定:
--
--    SELECT (読み取り): 本人のフォルダのみ
--    bucket_id = 'photos'
--    AND auth.uid()::text = (storage.foldername(name))[1]
--
--    INSERT (アップロード): 本人のフォルダのみ
--    bucket_id = 'photos'
--    AND auth.uid()::text = (storage.foldername(name))[1]
--
--    ファイルパスの形式: {user_id}/{filename}
--    例: 550e8400-e29b-41d4-a716-446655440000/abc123.jpg
--
-- これにより:
-- - ユーザーAの写真はユーザーBからは見えない
-- - URLを知っていてもRLSで弾かれる
-- - 公開URLは生成されない（signedURLのみ、有効期限付き）
