# 🌻 サンフラワープロジェクト テスト計画・進行管理

**最終更新**：2026-05-29  
**本番URL**：`https://funahashi-sunflower-pj.vercel.app`

---

## 凡例

- 🔴 **Critical** / 🟠 **High** / 🟡 **Medium** / 🟢 **Low**
- 🤖 **[AUTO]** = `npm run test:security` で自動チェック対象
- 👤 **[MANUAL]** = 手動確認が必要
- ☐ 未実施 / ☑ 合格 / ✗ 失敗（手動でチェック）

## 自動テスト実行方法

```bash
# 本番URLに対して実行
npm run test:security

# ローカル環境に対して実行
npm run dev  # 別ターミナルで起動
npm run test:security:local
```

実行結果は `test-results.json` に保存されます。

---

## 進行サマリ

| カテゴリ | 全体 | Auto | Manual |
|---|---|---|---|
| A. 認証 | 8 | 0 | 8 |
| B. 認可・プライバシー | 8 | 0 | 8 |
| C. API セキュリティ | 10 | 3 | 7 |
| D. OAuth攻撃 | 8 | 0 | 8 |
| E. ファイルアップロード | 6 | 0 | 6 |
| F. Storage直アクセス | 5 | 0 | 5 |
| G. XSS | 6 | 0 | 6 |
| H. CSRF | 3 | 0 | 3 |
| I. ビジネスロジック | 5 | 0 | 5 |
| J. 情報漏洩 | 7 | 5 | 2 |
| K. HTTPヘッダー | 9 | 5 | 4 |
| L. DoS | 4 | 0 | 4 |
| M. Open Redirect | 4 | 3 | 1 |
| N. クライアント側 | 3 | 0 | 3 |
| O. 機能テスト | 28 | 9 | 19 |
| P. ブラウザ互換 | 6 | 0 | 6 |
| **合計** | **120** | **25** | **95** |

---

# 🔴 Critical（本番公開前に必須）

## A. 認証

- [ ] **A1** 🔴 👤 Google OAuth で新規登録できる → `/start` で実施、`profiles` 行が増えること
- [ ] **A2** 🔴 👤 Google OAuth で再ログインできる → 同じUser IDで戻る
- [ ] **A3** 🔴 👤 メールOTPで新規登録できる → リンククリックでログイン成功
- [ ] **A4** 🔴 👤 メールOTPで再ログインできる → 既存アカウントに紐づく
- [ ] **A5** 🔴 👤 ログアウトが効く → `/me` で「未ログイン」になる

## B. 認可・プライバシー（最重要）

- [ ] **B1** 🔴 👤 ユーザーA・Bで互いのスタンプが見えないこと
- [ ] **B2** 🔴 👤 DevToolsから `profiles` 全件SELECT → 自分の行しか返らない
- [ ] **B3** 🔴 👤 他人のフォルダパスでStorage直アクセス → 拒否される
- [ ] **B4** 🔴 👤 `photos` バケットが Private → ダッシュボードで確認
- [ ] **B5** 🔴 👤 1時間以上前の署名付きURLは無効
- [ ] **B8** 🔴 👤 `/me` で見えるのは自分の情報のみ

## C. API セキュリティ

- [ ] **C1** 🔴 🤖 未認証で `/api/stamps/claim` → **401**
- [ ] **C2** 🔴 👤 bodyに他人のuser_id混入 → 自分のIDで処理される（無視される）
- [ ] **C3** 🔴 🤖 存在しないtype `diamond` を送信 → **400 または 401**
- [ ] **C4** 🔴 🤖 範囲外の年度 `2099` → **400 または 401**
- [ ] **C5** 🔴 👤 同じスタンプを2回 claim → 2回目は **409**

## D. OAuth攻撃

- [ ] **D1** 🔴 🤖 `/api/auth/callback?next=https://evil.com` → 拒否
- [ ] **D2** 🔴 🤖 `/login?next=https://evil.com` → `/stamp` にフォールバック
- [ ] **D3** 🔴 👤 OAuth code を2回使う → 2回目失敗
- [ ] **D4** 🔴 👤 code_verifier Cookie削除 → コード交換失敗

## E. ファイルアップロード

- [ ] **E1** 🔴 👤 .exe / .html を写真にUP → ブラウザがフィルタ

## F. Storage 直アクセス

- [ ] **F1** 🔴 👤 Supabase Storage の `photos` バケットが Private になっている
- [ ] **F2** 🔴 👤 Storage の RLSポリシー設定確認

## G. XSS / インジェクション

- [ ] **G1** 🔴 👤 ニックネームに `<script>alert(1)</script>` → エスケープされる
- [ ] **G2** 🔴 👤 ニックネームに `<img onerror=alert(1)>` → エスケープされる

## H. CSRF

- [ ] **H1** 🔴 👤 外部サイトから claim API POST → SameSite Cookie で401

## I. ビジネスロジック

- [ ] **I1** 🔴 👤 4種スタンプを瞬時に全取得 → 全て成功（仕様）
- [ ] **I2** 🔴 👤 撮り直しで取得日（acquired_at）が変わらないこと

## J. 情報漏洩

- [ ] **J1** 🔴 🤖 `.env*` が git に含まれていない
- [ ] **J2** 🔴 🤖 SERVICE_ROLE_KEY 相当のJWTがソースに含まれていない
- [ ] **J2b** 🔴 🤖 client component で SERVICE_ROLE_KEY を参照していない
- [ ] **J3** 🔴 🤖 `public/` に機密ファイル無し
- [ ] **J6** 🔴 🤖 `public/` に source map 無し
- [ ] **Build** 🔴 🤖 TypeScript型チェック通過

## K. HTTPヘッダー

- [ ] **K1** 🔴 🤖 HTTPS強制（HTTPからリダイレクト）
- [ ] **K2** 🔴 👤 認証Cookieに HttpOnly フラグ
- [ ] **K3** 🔴 👤 認証Cookieに Secure フラグ
- [ ] **K4** 🔴 👤 認証Cookieに SameSite=Lax または Strict

## M. オープンリダイレクト

- [ ] **M1** 🔴 🤖 `next=外部URL` を拒否
- [ ] **M2** 🔴 🤖 `next=javascript:...` を拒否
- [ ] **M3** 🔴 🤖 `next=//evil.com`（protocol-relative）を拒否

## O. 機能テスト（Critical）

- [ ] **O3-1** 🔴 👤 `/claim` 全フロー：intro→login→GPS→photo→done
- [ ] **O3-2** 🔴 👤 撮り直しで写真のみ更新、取得日変わらず
- [ ] **O4-1** 🔴 👤 マイスタンプは自分の分のみ表示
- [ ] **O4-2** 🔴 👤 写真付きスタンプは大きく表示される
- [ ] **O4-3** 🔴 👤 写真タップで PhotoModal が開く、Escで閉じる
- [ ] **O6-1** 🔴 👤 `/me` で自分のIDのみ表示
- [ ] **O7-1** 🔴 🤖 主要ページ（/, /start, /login, /stamp, /me, /claim）が200
- [ ] **O-404** 🔴 🤖 存在しないURLは404

## P. ブラウザ互換性

- [ ] **P1** 🔴 👤 iOS Safari で全機能動作（写真撮影・GPS含む）
- [ ] **P2** 🔴 👤 Android Chrome で全機能動作（写真撮影・GPS含む）

---

# 🟠 High（リリース前推奨）

## A. 認証

- [ ] **A6** 🟠 👤 セッション継続（ブラウザ閉じて再開）
- [ ] **A7** 🟠 👤 セッション期限切れの挙動
- [ ] **A8** 🟠 👤 複数タブで同じユーザーで動作

## B. 認可

- [ ] **B6** 🟠 👤 他人の署名付きURLを盗む → 期限内は閲覧可能（仕様）
- [ ] **B7** 🟠 👤 他人IDでprofilesをUPDATE → RLSで拒否

## C. API

- [ ] **C6** 🟠 👤 GPS必要なスタンプで座標なし → エラー
- [ ] **C7** 🟠 👤 GPS偽座標（畑の中心）で取得 → 現状は通る（active_events要設定）
- [ ] **C8** 🟠 👤 retakeモードで他人のスタンプ更新 → 自分のIDで処理
- [ ] **C9** 🟠 👤 巨大JSONペイロード → 上限で拒否
- [ ] **C-NoBody** 🟠 🤖 bodyなしPOST → 400/401
- [ ] **C-GET** 🟠 🤖 claim API にGET → 404/405

## D. OAuth

- [ ] **D5** 🟠 👤 メールOTPリンクの再利用 → 失敗
- [ ] **D6** 🟠 👤 メール列挙攻撃（存在しないアドレス）→ 同じレスポンス
- [ ] **D7** 🟠 👤 OTP有効期限切れ → 失敗

## E. アップロード

- [ ] **E2** 🟠 👤 100MB以上 → Storage上限で拒否
- [ ] **E3** 🟠 👤 ファイル名にパストラバーサル → 命名で無効化
- [ ] **E4** 🟠 👤 ファイル名にXSS → サーバー命名で無効化

## F. Storage

- [ ] **F3** 🟠 👤 バケット一覧API → 401/403
- [ ] **F4** 🟠 👤 他人フォルダへ書き込み → 拒否
- [ ] **F5** 🟠 👤 他人ファイル削除 → 拒否

## G. XSS

- [ ] **G3** 🟠 👤 type にSQL文字 → パラメータバインドで弾く
- [ ] **G4** 🟠 👤 URLパラメータ `event=<script>` → 安全に処理

## H. CSRF

- [ ] **H2** 🟠 👤 iframe で `/stamp` 埋め込み → X-Frame-Optionsで拒否
- [ ] **H3** 🟠 👤 CORS設定確認

## I. ビジネスロジック

- [ ] **I3** 🟠 👤 GPS必要時、遠隔地から → 403

## J. 情報漏洩

- [ ] **J4** 🟠 👤 エラーメッセージで内部情報が漏れない
- [ ] **J5** 🟠 👤 Vercelログにトークンが残らない

## K. HTTPヘッダー

- [ ] **K5** 🟠 🤖 X-Frame-Options または frame-ancestors
- [ ] **K6** 🟠 🤖 X-Content-Type-Options: nosniff
- [ ] **K7** 🟠 🤖 Referrer-Policy あり
- [ ] **K8** 🟠 🤖 Permissions-Policy あり

## L. DoS

- [ ] **L1** 🟠 👤 claim APIへ大量リクエスト → レート制限
- [ ] **L2** 🟠 👤 メールOTP大量送信 → Supabase側で制限
- [ ] **L3** 🟠 👤 自動化でアカウント大量作成（Captcha無し）

## O. 機能テスト（High）

- [ ] **O1-1** 🟠 👤 トップ：ヒーロー画像表示
- [ ] **O1-2** 🟠 👤 トップ：ナビゲーション動作
- [ ] **O1-3** 🟠 👤 トップ：リーリーが3箇所登場
- [ ] **O2-1** 🟠 🤖 `/start?event=seed` が種まき内容
- [ ] **O2-2** 🟠 🤖 `/start?event=water` が水やり内容
- [ ] **O2-3** 🟠 👤 startページの3ステップ表示
- [ ] **O2-4** 🟠 👤 CTAタップで /claim に遷移
- [ ] **O3-3** 🟠 👤 claim エラー表示が分かりやすい
- [ ] **O3-4** 🟠 👤 GPS許可方法アコーディオン
- [ ] **O3-5** 🟠 👤 写真なしで取得
- [ ] **O4-4** 🟠 👤 フォトアルバム2列表示
- [ ] **O4-5** 🟠 👤 成長ステージが現在のもののみ
- [ ] **O4-6** 🟠 👤 取得履歴が新着順
- [ ] **O4-7** 🟠 👤 ライブカメラ「準備中」表示
- [ ] **O5-1** 🟠 👤 ログイン後にプロフィール編集画面
- [ ] **O5-2** 🟠 👤 アバター変更が反映
- [ ] **O5-3** 🟠 👤 ニックネーム保存
- [ ] **O6-2** 🟠 👤 `/me` で全体カウント表示
- [ ] **O6-3** 🟠 👤 プロフィール未作成時に警告
- [ ] **O7-2** 🟠 👤 ホームのトップは透明背景キープ
- [ ] **O7-3** 🟠 👤 ログイン後アバター表示

## P. 互換性

- [ ] **P3** 🟠 👤 Windows Chrome（デスクトップ）
- [ ] **P4** 🟠 👤 Windows Edge

---

# 🟡 Medium（運用開始後）

## A. 認証

（特になし）

## C. API

- [ ] **C10** 🟡 👤 photoPathに他人パス → 文字列保存のみ、本人にも無効URL

## D. OAuth

- [ ] **D8** 🟡 👤 state パラメータ改ざん

## E. アップロード

- [ ] **E5** 🟡 👤 EXIF個人情報（仕様：現在保持）
- [ ] **E6** 🟡 👤 SVG with `<script>` → image/* でフィルタ

## G. XSS

- [ ] **G5** 🟡 👤 エラーメッセージのXSS
- [ ] **G6** 🟡 👤 クリップボード経由

## I. ロジック

- [ ] **I4** 🟡 👤 写真差し替えによる成果偽装
- [ ] **I5** 🟡 👤 NFTミントの不正トリガー（実装後）

## J. 情報

- [ ] **J7** 🟡 👤 robots.txt に管理URLが含まれない

## K. ヘッダー

- [ ] **K9** 🟡 👤 Content-Security-Policy

## L. DoS

- [ ] **L4** 🟡 👤 大量画像によるStorage枯渇

## M. リダイレクト

- [ ] **M4** 🟡 👤 SSRF（photoPathに `http://` 含む）

## N. クライアント

- [ ] **N1** 🟠 👤 LocalStorage の認証情報
- [ ] **N2** 🟠 👤 URLハッシュにトークン残らない
- [ ] **N3** 🟡 👤 コピー警告（仕様）

## O. 機能

- [ ] **O1-4** 🟡 👤 スクロール時Navが切り替わる
- [ ] **O1-5** 🟡 👤 モバイル：ハンバーガーメニュー
- [ ] **O4-8** 🟡 👤 PCでmax-w-2xl表示

## P. 互換性

- [ ] **P5** 🟡 👤 iOS Chrome
- [ ] **P6** 🟡 👤 Firefox

---

# 🟢 Low

- [ ] **G6** 🟢 👤 クリップボード経由のXSS
- [ ] **J6** 🟢 👤 source map 配信されないこと（自動化済み）

---

# 自動テスト結果の最新ログ

> 実行すると `test-results.json` が自動更新されます。

実行例：
```
🌻 サンフラワープロジェクト セキュリティ自動テスト
Target: https://funahashi-sunflower-pj.vercel.app

━━━ J. 情報漏洩（ローカルファイル） ━━━
  ✅ PASS [J1] .env系ファイルがgitに含まれない
  ✅ PASS [J2] service_role キー(JWT)が src/ にハードコードされていない
  ✅ PASS [J2b] process.env.SUPABASE_SERVICE_ROLE_KEY が client側に出ない
  ✅ PASS [J3] public/ に機密ファイルがない
  ✅ PASS [J6] public/ に source map (.map) がない
  ✅ PASS [Build] TypeScript 型チェックが通る

━━━ K. HTTPヘッダー（本番URL） ━━━
  ✅ PASS [Network] 本番URL疎通
  ✅ PASS [K1] HTTPからHTTPSへリダイレクト
  ...

━━━ 結果 ━━━
  Pass    : 25
  Fail    : 0
  Skip    : 0
  Total   : 25

🎉 全テスト合格
```

---

# 既知の制約事項（仕様として許容）

- **B6**: 署名付きURL有効期限内（1時間）は知っている人なら閲覧可能（Supabase Storage 仕様）
- **C7**: `active_events`が未設定の状態ではGPS検証がスキップされる（テスト・準備期間対応、本番イベント時は必ず設定）
- **L3**: Captchaなし。大規模スパム対策は将来検討
- **I4**: 写真差し替えの履歴なし
- **E5**: EXIF情報の自動削除なし（本人のみ閲覧可能なので影響限定）

---

# 緊急時対応

1. Vercel Dashboard → Logs：エラー内容・タイムスタンプ
2. Supabase Dashboard → Logs：認証・DB
3. 影響範囲：1ユーザー / 全ユーザー
4. 対応：
   - Vercel：Deployments から Rollback
   - Supabase：Auth設定・RLS設定変更
   - コード修正 → 緊急デプロイ

---

# テスト記録欄

各テスト実施時に記入：

```
[テストID]
日付  : 2026-XX-XX
実施者: 
環境  : (iOS Safari 17 / Android Chrome 120 / Win Chrome 等)
結果  : ✅ Pass / ❌ Fail / ⚠️ 要修正
備考  :
スクリーンショット:
```
