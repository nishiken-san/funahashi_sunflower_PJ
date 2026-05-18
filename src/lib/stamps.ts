// ===== スタンプ状態管理 =====
// デモ時はlocalStorage、本番時はDB+NFTに置き換え

import { StampType } from "@/config/contract";

export interface StampRecord {
  type: StampType;
  acquiredAt: string;  // ISO date
  photoUrl?: string;   // data URL or server URL
}

export interface UserProfile {
  name: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = "sunflower_stamps";
const PROFILE_KEY = "sunflower_profile";

// プロフィール
export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(name: string, email?: string): UserProfile {
  const existing = getProfile();
  const profile: UserProfile = {
    name,
    email,
    avatarUrl: existing?.avatarUrl,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function updateAvatar(avatarUrl: string): void {
  const profile = getProfile();
  if (profile) {
    profile.avatarUrl = avatarUrl;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

// スタンプ
export function getStamps(): StampRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function hasStamp(type: StampType): boolean {
  return getStamps().some(s => s.type === type);
}

export function addStamp(type: StampType, photoUrl?: string): StampRecord {
  const stamps = getStamps();
  if (stamps.some(s => s.type === type)) {
    throw new Error("このスタンプは取得済みです");
  }
  const record: StampRecord = {
    type,
    acquiredAt: new Date().toISOString(),
    photoUrl,
  };
  stamps.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps));

  // TODO: ここでNFTミントAPIを呼び出す
  // await fetch('/api/mint', { method: 'POST', body: JSON.stringify({ type, photoUrl }) });

  return record;
}

export function getBasicCount(): number {
  const stamps = getStamps();
  const basicTypes: StampType[] = ["seed", "water", "bloom", "harvest"];
  return basicTypes.filter(t => stamps.some(s => s.type === t)).length;
}

export function getTotalCount(): number {
  return getStamps().length;
}

export function resetAll(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
