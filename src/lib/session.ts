import { createServerComponentClient } from "@/lib/supabase-server";

// APIルートで認証済みユーザーのIDを取得。未認証はnull。
export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
