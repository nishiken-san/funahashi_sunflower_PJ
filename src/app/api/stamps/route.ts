import { NextResponse } from "next/server";
import { createServerComponentClient, createAdminClient } from "@/lib/supabase-server";

// GET /api/stamps — 自分のスタンプ一覧（フロントはブラウザクライアント経由で取得するため主に管理用）
export async function GET() {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const admin = createAdminClient();
  const { data: stamps, error } = await admin
    .from("stamps")
    .select("id, type, year, photo_path, acquired_at")
    .eq("user_id", user.id)
    .order("acquired_at", { ascending: true });

  if (error) return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  return NextResponse.json({ stamps });
}
