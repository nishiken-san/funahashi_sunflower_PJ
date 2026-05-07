// コントラクトアドレス（デプロイ後に設定）
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Polygon Amoy テストネット
export const CHAIN_CONFIG = {
  chainId: "0x13882", // 80002
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
};

// トークンID体系
export const TOKEN_IDS = {
  SEED_2026: 1001,
  GROW_2026: 2001,
  BLOOM_2026: 3001,
  HARVEST_2026: 4001,
  COMPLETE_2026: 9001,
} as const;

// スタンプ情報
export const STAMPS = [
  { id: TOKEN_IDS.SEED_2026, name: "種まき", icon: "🌱", month: "6月", hasGrowth: true },
  { id: TOKEN_IDS.GROW_2026, name: "成長見守り", icon: "🌿", month: "7月", hasGrowth: false },
  { id: TOKEN_IDS.BLOOM_2026, name: "開花・撮影", icon: "🌻", month: "8月", hasGrowth: false },
  { id: TOKEN_IDS.HARVEST_2026, name: "収穫・搾油", icon: "🫙", month: "10月", hasGrowth: false },
] as const;

// 成長ステージ
export const GROWTH_STAGES = [
  { stage: 0, label: "種", icon: "🌰", description: "土の中で眠っています" },
  { stage: 1, label: "芽", icon: "🌱", description: "小さな芽が出ました" },
  { stage: 2, label: "葉", icon: "🌿", description: "葉が広がってきました" },
  { stage: 3, label: "つぼみ", icon: "🫑", description: "つぼみが膨らんでいます" },
  { stage: 4, label: "開花", icon: "🌻", description: "満開です！" },
] as const;

// 特典
export const REWARDS = [
  { stampsRequired: 1, title: "畑ライブカメラ", description: "自分の区画の映像にアクセス", icon: "📹" },
  { stampsRequired: 2, title: "記念壁紙", description: "スマホ壁紙画像をダウンロード", icon: "📱" },
  { stampsRequired: 3, title: "バーチャル畑", description: "バーチャル空間でひまわり畑を散歩", icon: "🌐" },
  { stampsRequired: 4, title: "翌年先行オーナー権", description: "来年の区画を優先的に確保", icon: "⭐" },
] as const;

// ERC-1155 ABI（必要な関数のみ）
export const CONTRACT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function getUserTokens(address user) view returns (uint256[])",
  "function hasStamp(address user, uint256 tokenId) view returns (bool)",
  "function getPlotInfo(address user, uint256 tokenId) view returns (string plotName, string sunflowerName, string photoHash, uint256 acquiredAt)",
  "function growthStage(uint256 tokenId) view returns (uint8)",
  "function uri(uint256 tokenId) view returns (string)",
  "function mintStamp(address to, uint256 tokenId, string plotName, string sunflowerName, string photoHash)",
  "function updateGrowthStage(uint256 tokenId, uint8 newStage)",
  "function updatePhotoHash(address owner, uint256 tokenId, string newPhotoHash)",
  "event StampMinted(address indexed to, uint256 indexed tokenId, uint256 timestamp)",
  "event GrowthStageUpdated(uint256 indexed tokenId, uint8 newStage)",
] as const;
