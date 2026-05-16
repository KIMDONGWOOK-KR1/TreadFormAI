import { Platform } from 'react-native';

/**
 * Android 에뮬레이터: 10.0.2.2 = 호스트 PC 의 loopback (가장 안정).
 * 실기기 + 동일 WiFi LAN: 호스트 PC 의 LAN IP. WiFi 재접속마다 변경 가능.
 */
const HOST_PC_LAN_IP = '192.168.0.11';
const EMULATOR_HOST = '10.0.2.2';
const PORT = 8000;

// Dev 빌드에서는 안드로이드 에뮬레이터를 가정하고 10.0.2.2 를 우선.
// 실기기 dev 는 별도 LAN IP 가 필요하므로 추후 ENV/설정 화면으로 분리.
export const BASE_URL =
  Platform.OS === 'android' && __DEV__
    ? `http://${EMULATOR_HOST}:${PORT}`
    : `http://${HOST_PC_LAN_IP}:${PORT}`;

export const ENDPOINTS = {
  UPLOAD: '/api/upload',
  ANALYSIS: (id: string) => `/api/analysis/${id}`,
  MEMBERS: '/api/members',
  MEMBER_HISTORY: (id: string) => `/api/members/${id}/history`,
} as const;

export const POLL_INTERVAL_MS = 3000;
