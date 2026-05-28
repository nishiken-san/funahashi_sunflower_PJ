import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient, createAdminClient } from "@/lib/supabase-server";

// GET /api/profile — 自分のプロフィールを取得
export async function GET() {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  return NextResponse.json({ user: profile });
}

// PUT /api/profile — プロフィール更新（本人のみ）
export async function PUT(req: NextRequest) {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const body = await req.json();
  const { name, avatar_url } = body as { name?: string; avatar_url?: string };

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof avatar_url === "string") updates.avatar_url = avatar_url;

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("id, name, avatar_url")
    .single();

  if (error) return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  return NextResponse.json({ user: profile });
}
