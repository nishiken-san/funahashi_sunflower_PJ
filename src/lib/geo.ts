import { FIELD_CENTER } from "@/config/contract";

// Haversine formula
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface GeoResult {
  ok: boolean;
  distance?: number;
  error?: string;
}

export function checkLocation(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ok: true }); // GPS非対応の場合は許可
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistanceKm(
          pos.coords.latitude, pos.coords.longitude,
          FIELD_CENTER.lat, FIELD_CENTER.lng
        );
        if (dist <= FIELD_CENTER.radiusKm) {
          resolve({ ok: true, distance: dist });
        } else {
          resolve({ ok: false, distance: dist, error: `畑から${dist.toFixed(1)}km離れています` });
        }
      },
      () => {
        // 位置情報拒否の場合も許可（良識に委ねる）
        resolve({ ok: true });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}
