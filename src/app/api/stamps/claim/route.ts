import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient, createAdminClient } from "@/lib/supabase-server";
import { FIELD_CENTER } from "@/config/contract";

// ===== POST /api/stamps/claim =====
// スタンプ取得リクエストを検証し、問題なければDBに登録
// ブラウザからstampsテーブルへの直接INSERTはRLSで禁止されているため、
// このAPIルートが唯一のスタンプ取得経路
export async function POST(req: NextRequest) {
  try {
    // --- 1. 認証チェック ---
    const supabase = await createServerComponentClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // --- 2. リクエストボディの検証 ---
    const body = await req.json();
    const { type, year = 2026, photoPath, lat, lng } = body as {
      type?: string;
      year?: number;
      photoPath?: string;
      lat?: number;
      lng?: number;
    };

    // 許可されたスタンプタイプのみ受け付け
    const allowedTypes = ["seed", "water", "bloom", "harvest", "photo", "home"];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "無効なスタンプタイプです" },
        { status: 400 }
      );
    }

    // yearの範囲チェック
    if (year < 2026 || year > 2030) {
      return NextResponse.json(
        { error: "無効な年度です" },
        { status: 400 }
      );
    }

    // --- 3. イベント期間チェック（未設定時はGPS不要でOK） ---
    const admin = createAdminClient();
    const { data: event } = await admin
      .from("active_events")
      .select("*")
      .eq("stamp_type", type)
      .eq("year", year)
      .eq("is_active", true)
      .gte("ends_at", new Date().toISOString())
      .lte("starts_at", new Date().toISOString())
      .maybeSingle();

    // active_eventsが未設定の場合はGPS検証をスキップ（テスト・準備期間対応）
    const requiresGPS = event?.requires_gps ?? false;

    // --- 4. GPS検証（イベントで要求された場合のみ） ---
    if (requiresGPS) {
      if (lat == null || lng == null) {
        return NextResponse.json(
          { error: "位置情報が必要です" },
          { status: 400 }
        );
      }

      const distance = haversineKm(lat, lng, FIELD_CENTER.lat, FIELD_CENTER.lng);
      if (distance > FIELD_CENTER.radiusKm) {
        return NextResponse.json(
          { error: `畑から${distance.toFixed(1)}km離れています（${FIELD_CENTER.radiusKm}km以内で取得可能）` },
          { status: 403 }
        );
      }
    }

    // --- 5. 重複チェック ---
    const { data: existing } = await admin
      .from("stamps")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", type)
      .eq("year", year)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "このスタンプは取得済みです" },
        { status: 409 }
      );
    }

    // --- 6. スタンプ登録（admin権限で実行） ---
    const { data: stamp, error: insertError } = await admin
      .from("stamps")
      .insert({
        user_id: user.id,
        type,
        year,
        photo_path: photoPath || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Stamp insert error:", insertError);
      return NextResponse.json(
        { error: "スタンプの登録に失敗しました" },
        { status: 500 }
      );
    }

    // --- 7. NFTミント（TODO） ---
    // const tokenId = getTokenId(type, year);
    // const userWallet = await getOrCreateWallet(user.id);
    // const txHash = await mintNFT(userWallet, tokenId);
    // await admin.from("stamps").update({ nft_token_id: tokenId, nft_tx_hash: txHash }).eq("id", stamp.id);

    return NextResponse.json({ stamp }, { status: 201 });

  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// --- Haversine距離計算 ---
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
