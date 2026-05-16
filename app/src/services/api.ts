import axios, { AxiosError } from 'axios';

import { BASE_URL, ENDPOINTS } from '../constants/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

export interface UploadResponse {
  analysis_id: string;
  status: 'processing';
  estimated_seconds: number;
}

export interface AnalysisStatusProcessing {
  analysis_id: string;
  status: 'processing';
  progress?: number;
}

export interface AnalysisStatusFailed {
  analysis_id: string;
  status: 'failed';
  error_code?: string;
  message_ko?: string;
}

export type Confidence = 'high' | 'medium' | 'low';

export interface AnalysisWarning {
  code: string;
  message_ko: string;
}

export interface AnalysisSummary {
  total_frames: number;
  duration_sec: number;
  fps: number;
  total_strikes: number;
  left_strikes: number;
  right_strikes: number;
  danger_count: number;
  cadence_spm: number;
}

export interface KneeFlexionMetric {
  avg_angle: number;
  left_avg: number;
  right_avg: number;
  status_counts: {
    stiff: number;
    good: number;
    over_bent: number;
    borderline: number;
  };
  per_strike: Array<{ frame: number; angle: number; status: string; foot: 'left' | 'right' }>;
}

export interface FootStrikeMetric {
  status_counts: { heel: number; midfoot: number; forefoot: number };
  per_strike: Array<{ frame: number; status: string; foot: 'left' | 'right' }>;
}

export interface OverstridingMetric {
  avg_distance: number;
  status_counts: { good: number; over: number };
  per_strike: Array<{ frame: number; distance: number; status: string; foot: 'left' | 'right' }>;
}

export interface VerticalOscillationMetric {
  avg_value: number;
  left_avg: number;
  right_avg: number;
  status: string;
  per_stride: Array<unknown>;
}

export interface AnalysisMetrics {
  knee_flexion: KneeFlexionMetric;
  foot_strike: FootStrikeMetric;
  overstriding: OverstridingMetric;
  vertical_oscillation: VerticalOscillationMetric;
}

export interface AsymmetryResult {
  strike_count_ratio: number;
  knee_angle_ratio: number;
  oscillation_ratio: number;
  is_warning: boolean;
}

export interface DangerTimestamp {
  time_sec: number;
  type: string;
  color: string;
}

export interface AnalysisResultPayload {
  analysis_id: string;
  summary: AnalysisSummary;
  metrics: AnalysisMetrics;
  asymmetry: AsymmetryResult;
  danger_timestamps: DangerTimestamp[];
  confidence: Confidence;
  warnings: AnalysisWarning[];
}

export interface AnalysisStatusCompleted {
  analysis_id: string;
  status: 'completed';
  completed_at: string;
  elapsed_sec: number;
  rendered_video_url: string;
  csv_report_url: string;
  coach_message: string;
  analysis_result: AnalysisResultPayload;
}

export type AnalysisResult =
  | AnalysisStatusProcessing
  | AnalysisStatusCompleted
  | AnalysisStatusFailed;

export interface ApiError {
  error_code?: string;
  message_ko?: string;
  status?: number;
  isNetwork?: boolean;
}

interface XhrUploadError {
  isXhrUpload: true;
  isNetwork?: boolean;
  status?: number;
  detail?: { error_code?: string; message_ko?: string } | string;
}

export function normalizeApiError(error: unknown): ApiError {
  const xhrErr = error as Partial<XhrUploadError>;
  if (xhrErr?.isXhrUpload) {
    if (xhrErr.isNetwork) {
      return { isNetwork: true };
    }
    const detail = xhrErr.detail;
    if (detail && typeof detail === 'object') {
      return {
        error_code: detail.error_code,
        message_ko: detail.message_ko,
        status: xhrErr.status,
      };
    }
    return { status: xhrErr.status };
  }
  const axiosError = error as AxiosError<{
    detail?: { error_code?: string; message_ko?: string } | string;
  }>;
  if (axiosError?.isAxiosError) {
    if (!axiosError.response) {
      return { isNetwork: true };
    }
    const detail = axiosError.response.data?.detail;
    if (detail && typeof detail === 'object') {
      return {
        error_code: detail.error_code,
        message_ko: detail.message_ko,
        status: axiosError.response.status,
      };
    }
    return { status: axiosError.response.status };
  }
  return {};
}

/**
 * axios v1.16 의 transformRequest 가 RN FormData 의 file blob descriptor 를
 * 올바르게 다루지 못해 multipart body 가 비어 보내져 ERR_NETWORK 가 됨.
 * 따라서 업로드만 XHR 로 처리 — RN 의 XHR/OkHttp 가 native FormData 를
 * 정상 multipart 로 인코딩하고 boundary 도 자동 부착.
 */
export function uploadVideo(
  videoUri: string,
  memberId?: string,
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  return new Promise<UploadResponse>((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'run.mp4',
    } as unknown as Blob);
    if (memberId) {
      formData.append('member_id', memberId);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL + ENDPOINTS.UPLOAD);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          const err: XhrUploadError = { isXhrUpload: true, status: xhr.status };
          reject(err);
        }
        return;
      }
      let detail: XhrUploadError['detail'];
      try {
        const parsed = JSON.parse(xhr.responseText);
        detail = parsed?.detail;
      } catch {}
      const err: XhrUploadError = {
        isXhrUpload: true,
        status: xhr.status,
        detail,
      };
      reject(err);
    };
    xhr.onerror = () => {
      const err: XhrUploadError = { isXhrUpload: true, isNetwork: true };
      reject(err);
    };
    xhr.ontimeout = () => {
      const err: XhrUploadError = { isXhrUpload: true, isNetwork: true };
      reject(err);
    };
    xhr.send(formData);
  });
}

export async function getAnalysisResult(analysisId: string): Promise<AnalysisResult> {
  const response = await api.get<AnalysisResult>(ENDPOINTS.ANALYSIS(analysisId));
  return response.data;
}

export interface Member {
  id: string;
  name: string;
  trainer_id: string;
  created_at: string;
}

export async function createMember(name: string, trainerId: string): Promise<Member> {
  const response = await api.post<Member>(ENDPOINTS.MEMBERS, {
    name,
    trainer_id: trainerId,
  });
  return response.data;
}

export async function listMembers(trainerId: string): Promise<Member[]> {
  const response = await api.get<Member[]>(ENDPOINTS.MEMBERS, {
    params: { trainer_id: trainerId },
  });
  return response.data;
}

export async function getMemberHistory(memberId: string) {
  const response = await api.get(ENDPOINTS.MEMBER_HISTORY(memberId));
  return response.data;
}

export { api };
