import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerComponentClient, createAdminClient } from "@/lib/supabase-server";

// POST /api/upload — 写真をSupabase Storageにアップロード
// フロント側はbrowser clientで直接アップロード可能だが、
// サーバー側でMIMEタイプ・サイズ検証を行いたい場合にこのルートを使う
export async function POST(req: NextRequest) {
  const supabase = await createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;
  if (!file) return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "5MB以下にしてください" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "画像のみ対応しています" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("photos")
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  return NextResponse.json({ path: storagePath }, { status: 201 });
}
