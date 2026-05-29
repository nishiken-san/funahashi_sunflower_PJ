// ===== 畑の座標（GPS判定用）=====
export const FIELD_CENTER = {
  lat: 36.6953,  // 舟橋村ひまわり畑（仮）
  lng: 137.1867,
  radiusKm: 1.0,
};

// ===== Token ID =====
export const TOKEN_IDS = {
  SEED_2026: 1001,   // 種まき
  WATER_2026: 2001,  // 水まき
  BLOOM_2026: 3001,  // 開花
  HARVEST_2026: 4001,// 収穫
  PHOTO_2026: 5001,  // フォトコンテスト（ボーナス）
  HOME_2026: 6001,   // 自宅栽培（ボーナス）
  COMPLETE_2026: 9001,
} as const;

// ===== スタンプ定義 =====
export type StampType = "seed" | "water" | "bloom" | "harvest" | "photo" | "home";

export interface StampDef {
  id: number;
  type: StampType;
  name: string;
  icon: string;
  month: string;
  description: string;
  isBonus: boolean;
  requiresGPS: boolean;
  requiresPhoto: boolean;
}

export const STAMPS: StampDef[] = [
  { id: TOKEN_IDS.SEED_2026, type: "seed", name: "種まき", icon: "🌱", month: "6月", description: "畑で種まきイベントに参加", isBonus: false, requiresGPS: true, requiresPhoto: true },
  { id: TOKEN_IDS.WATER_2026, type: "water", name: "水まき", icon: "💧", month: "6〜7月", description: "畑に水やりに来てくれた", isBonus: false, requiresGPS: true, requiresPhoto: true },
  { id: TOKEN_IDS.BLOOM_2026, type: "bloom", name: "開花", icon: "🌻", month: "8月", description: "開花したひまわり畑を訪問", isBonus: false, requiresGPS: true, requiresPhoto: true },
  { id: TOKEN_IDS.HARVEST_2026, type: "harvest", name: "収穫", icon: "🫙", month: "9〜10月", description: "収穫イベントに参加", isBonus: false, requiresGPS: true, requiresPhoto: true },
  { id: TOKEN_IDS.PHOTO_2026, type: "photo", name: "フォトコンテスト", icon: "📸", month: "8月", description: "ひまわりの写真を投稿", isBonus: true, requiresGPS: false, requiresPhoto: true },
  { id: TOKEN_IDS.HOME_2026, type: "home", name: "自宅栽培", icon: "🏠", month: "通年", description: "自宅で育てたひまわりの写真を投稿", isBonus: true, requiresGPS: false, requiresPhoto: true },
];

export const BASIC_STAMPS = STAMPS.filter(s => !s.isBonus);
export const BONUS_STAMPS = STAMPS.filter(s => s.isBonus);

// ===== 成長ステージ =====
export const GROWTH_STAGES = [
  { stage: 0, label: "種", icon: "🌰" },
  { stage: 1, label: "芽", icon: "🌱" },
  { stage: 2, label: "葉", icon: "🌿" },
  { stage: 3, label: "つぼみ", icon: "🫑" },
  { stage: 4, label: "開花", icon: "🌻" },
] as const;

// ===== 特典 =====
export interface RewardDef {
  stampsRequired: number;
  title: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}
export const REWARDS: readonly RewardDef[] = [
  { stampsRequired: 1, title: "畑ライブカメラ", description: "自分の区画の映像にアクセス", icon: "📹", comingSoon: true },
  { stampsRequired: 2, title: "記念壁紙", description: "スマホ壁紙画像をダウンロード", icon: "📱" },
  { stampsRequired: 3, title: "バーチャル畑", description: "バーチャル空間でひまわり畑を散歩", icon: "🌐", comingSoon: true },
  { stampsRequired: 4, title: "翌年先行オーナー権", description: "来年の区画を優先的に確保", icon: "⭐" },
] as const;

// ===== コントラクト設定 =====
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const CHAIN_CONFIG = {
  chainId: "0x13882",
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
};

export const CONTRACT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getUserTokens(address user) view returns (uint256[])",
  "function hasStamp(address user, uint256 tokenId) view returns (bool)",
  "function getPlotInfo(address user, uint256 tokenId) view returns (string, string, string, uint256)",
  "function growthStage(uint256 tokenId) view returns (uint8)",
  "function mintStamp(address to, uint256 tokenId, string plotName, string sunflowerName, string photoHash)",
  "function updateGrowthStage(uint256 tokenId, uint8 newStage)",
] as const;
