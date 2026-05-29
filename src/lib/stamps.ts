// ===== スタンプ操作（Supabase版） =====
// 読み取り: Supabaseクライアント経由（RLSで本人のみ）
// 書き込み: /api/stamps/claim 経由（サーバーサイド検証）

import { createClient } from "@/lib/supabase-browser";
import type { StampType } from "@/config/contract";

export interface StampRecord {
  id: string;
  type: StampType;
  year: number;
  photo_path: string | null;
  acquired_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
}

// ===== 認証 =====

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// provider を "google" | "github" で切り替え可能
const OAUTH_PROVIDER: "google" | "github" = "google";

export async function signInWithGoogle(next = "/stamp") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: OAUTH_PROVIDER,
    options: { redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) throw error;
}

export async function signInWithEmail(email: string, next = "/stamp") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// ===== プロフィール =====

// Googleログイン時にアバターをプロフィールへ自動同期（未設定の場合のみ）
export async function syncGoogleAvatar(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Googleメタデータからアバター取得（avatar_url または picture）
  const googleAvatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;
  if (!googleAvatar) return;

  // プロフィールに未設定の場合のみ反映（手動変更を上書きしない）
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .maybeSingle();

  if (!profile?.avatar_url) {
    await supabase
      .from("profiles")
      .update({ avatar_url: googleAvatar })
      .eq("id", user.id);
  }
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const supabase = createClient();

  // ログイン中のユーザーを確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // プロフィールを取得
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .maybeSingle();

  if (existing) return existing;

  // プロフィールがない場合は自動作成（トリガー未発火の保険）
  const name = (user.user_metadata?.name || user.user_metadata?.full_name || "") as string;
  const avatar_url = (user.user_metadata?.avatar_url || user.user_metadata?.picture || null) as string | null;

  const { data: created } = await supabase
    .from("profiles")
    .insert({ id: user.id, name, avatar_url })
    .select("id, name, avatar_url")
    .single();

  return created;
}

export async function updateProfile(updates: { name?: string; avatar_url?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id, name, avatar_url")
    .single();
  return data;
}

// ===== アバターアップロード =====

export async function uploadAvatar(file: File): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, { upsert: true });

  if (error) return null;

  // 署名付きURLを生成（1年有効）
  const { data: urlData } = await supabase.storage
    .from("photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (urlData?.signedUrl) {
    await updateProfile({ avatar_url: urlData.signedUrl });
    return urlData.signedUrl;
  }
  return null;
}

// ===== スタンプ読み取り（RLSで本人のみ） =====

export async function fetchStamps(): Promise<StampRecord[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("stamps")
    .select("id, type, year, photo_path, acquired_at")
    .order("acquired_at", { ascending: true });
  return data || [];
}

export function hasStampInList(stamps: StampRecord[], type: StampType): boolean {
  return stamps.some(s => s.type === type);
}

export function getBasicCountFromList(stamps: StampRecord[]): number {
  const basicTypes: StampType[] = ["seed", "water", "bloom", "harvest"];
  return basicTypes.filter(t => stamps.some(s => s.type === t)).length;
}

// ===== スタンプ取得（サーバーAPI経由） =====

export async function claimStamp(
  type: StampType,
  options?: { photoPath?: string; lat?: number; lng?: number; retake?: boolean }
): Promise<StampRecord> {
  const res = await fetch("/api/stamps/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      photoPath: options?.photoPath,
      lat: options?.lat,
      lng: options?.lng,
      retake: options?.retake ?? false,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "取得に失敗しました");
  }

  const data = await res.json();
  return data.stamp;
}

// ===== 写真アップロード（スタンプ用） =====

export async function uploadStampPhoto(file: File): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const path = `${user.id}/${filename}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file);

  if (error) return null;
  return path; // DBに保存するパス（URLではない）
}

// ===== 写真の署名付きURL取得（本人のみ） =====

export async function getPhotoUrl(path: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from("photos")
    .createSignedUrl(path, 60 * 60); // 1時間有効
  return data?.signedUrl || null;
}

// ===== 参加統計（匿名集計、全員閲覧可） =====

export async function fetchStats(): Promise<{ type: string; participant_count: number }[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("stamp_stats")
    .select("type, participant_count")
    .eq("year", 2026);
  return data || [];
}
