import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_CONFIG } from "@/config/contract";

// 読み取り専用プロバイダー（ウォレット不要で情報取得可能）
export function getReadProvider() {
  return new JsonRpcProvider(CHAIN_CONFIG.rpcUrls[0]);
}

// 読み取り専用コントラクト
export function getReadContract() {
  if (!CONTRACT_ADDRESS) return null;
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, getReadProvider());
}

// ウォレット接続
export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("ウォレットが見つかりません");
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);

  // Amoyテストネットへの切り替え
  try {
    await provider.send("wallet_switchEthereumChain", [
      { chainId: CHAIN_CONFIG.chainId },
    ]);
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      await provider.send("wallet_addEthereumChain", [CHAIN_CONFIG]);
    }
  }

  const signer = await provider.getSigner();
  return { provider, signer, address: accounts[0] };
}

// ユーザーのスタンプ保有状況を取得
export async function getUserStamps(address: string) {
  const contract = getReadContract();
  if (!contract) return [];

  try {
    const tokens: bigint[] = await contract.getUserTokens(address);
    return tokens.map((t) => Number(t));
  } catch {
    return [];
  }
}

// 特定スタンプの保有確認
export async function checkStamp(address: string, tokenId: number) {
  const contract = getReadContract();
  if (!contract) return false;

  try {
    return await contract.hasStamp(address, tokenId);
  } catch {
    return false;
  }
}

// 区画情報の取得
export async function getPlotInfo(address: string, tokenId: number) {
  const contract = getReadContract();
  if (!contract) return null;

  try {
    const [plotName, sunflowerName, photoHash, acquiredAt] =
      await contract.getPlotInfo(address, tokenId);
    return {
      plotName,
      sunflowerName,
      photoHash,
      acquiredAt: Number(acquiredAt),
    };
  } catch {
    return null;
  }
}

// 成長ステージの取得
export async function getGrowthStage(tokenId: number) {
  const contract = getReadContract();
  if (!contract) return 0;

  try {
    const stage = await contract.growthStage(tokenId);
    return Number(stage);
  } catch {
    return 0;
  }
}

// 管理者用：スタンプのミント
export async function adminMintStamp(
  signer: unknown,
  to: string,
  tokenId: number,
  plotName: string,
  sunflowerName: string,
  photoHash: string
) {
  if (!CONTRACT_ADDRESS) throw new Error("コントラクト未設定");
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer as never);
  const tx = await contract.mintStamp(to, tokenId, plotName, sunflowerName, photoHash);
  return tx.wait();
}

// 管理者用：成長ステージ更新
export async function adminUpdateGrowth(
  signer: unknown,
  tokenId: number,
  newStage: number
) {
  if (!CONTRACT_ADDRESS) throw new Error("コントラクト未設定");
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer as never);
  const tx = await contract.updateGrowthStage(tokenId, newStage);
  return tx.wait();
}

// ethereum型定義
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
