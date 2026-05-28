import { createBrowserClient } from "@supabase/ssr";

// ブラウザ用クライアント
// anon キーを使用 → RLSポリシーにより本人のデータのみアクセス可能
// service_role キーは絶対にブラウザに渡さない
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
