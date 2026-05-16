import React from 'react';
import { View } from 'react-native';

import { MetricBadge, type MetricStatus } from './MetricBadge';
import type {
  AnalysisMetrics,
  AsymmetryResult,
  FootStrikeMetric,
  KneeFlexionMetric,
  OverstridingMetric,
  VerticalOscillationMetric,
} from '../services/api';

function totalCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((s, n) => s + n, 0);
}

function classifyKnee(knee: KneeFlexionMetric): { status: MetricStatus; detail: string } {
  const c = knee.status_counts;
  const total = totalCounts(c) || 1;
  const dangerRatio = ((c.stiff || 0) + (c.over_bent || 0)) / total;
  const borderlineRatio = (c.borderline || 0) / total;
  if (dangerRatio > 0.3) {
    return { status: 'danger', detail: '경직 또는 과굴곡' };
  }
  if (borderlineRatio > 0.5) {
    return { status: 'warning', detail: '경계 구간 많음' };
  }
  return { status: 'safe', detail: '정상 범위' };
}

function classifyFootStrike(fs: FootStrikeMetric): {
  status: MetricStatus;
  detail: string;
  dominant: 'heel' | 'midfoot' | 'forefoot';
} {
  const c = fs.status_counts;
  const total = totalCounts(c) || 1;
  const heel = (c.heel || 0) / total;
  const fore = (c.forefoot || 0) / total;
  const mid = (c.midfoot || 0) / total;
  const dominant: 'heel' | 'midfoot' | 'forefoot' =
    heel >= fore && heel >= mid ? 'heel' : fore >= mid ? 'forefoot' : 'midfoot';
  if (heel > 0.5) {
    return { status: 'danger', detail: '뒤꿈치 착지 우세', dominant };
  }
  if (fore > 0.6) {
    return { status: 'warning', detail: '앞꿈치 비율 높음', dominant };
  }
  return { status: 'safe', detail: '중족 착지 안정', dominant };
}

function classifyOverstriding(o: OverstridingMetric): {
  status: MetricStatus;
  detail: string;
} {
  const c = o.status_counts;
  const total = totalCounts(c) || 1;
  const overRatio = (c.over || 0) / total;
  if (overRatio > 0.3) {
    return { status: 'danger', detail: '오버스트라이드 잦음' };
  }
  if (overRatio > 0.1) {
    return { status: 'warning', detail: '간헐적 오버스트라이드' };
  }
  return { status: 'safe', detail: '안정적인 보폭' };
}

function classifyVerticalOsc(v: VerticalOscillationMetric): {
  status: MetricStatus;
  detail: string;
} {
  const s = (v.status || '').toLowerCase();
  if (s === 'high' || s === 'excessive' || s === 'danger') {
    return { status: 'danger', detail: '수직 진폭 과다' };
  }
  if (s === 'borderline' || s === 'warning' || s === 'elevated') {
    return { status: 'warning', detail: '수직 진폭 다소 큼' };
  }
  return { status: 'safe', detail: '적정 수직 진폭' };
}

function classifyAsymmetry(a: AsymmetryResult): { status: MetricStatus; detail: string } {
  if (a.is_warning) {
    const maxRatio = Math.max(
      Math.abs(a.strike_count_ratio),
      Math.abs(a.knee_angle_ratio),
      Math.abs(a.oscillation_ratio),
    );
    if (maxRatio > 0.2) {
      return { status: 'danger', detail: '좌우 차이 큼' };
    }
    return { status: 'warning', detail: '좌우 차이 다소 있음' };
  }
  return { status: 'safe', detail: '좌우 대칭 양호' };
}

interface Props {
  metrics: AnalysisMetrics;
  asymmetry: AsymmetryResult;
}

const FOOT_LABEL: Record<'heel' | 'midfoot' | 'forefoot', string> = {
  heel: '뒤꿈치 우세',
  midfoot: '중족 우세',
  forefoot: '앞꿈치 우세',
};

export const MetricsSummary: React.FC<Props> = ({ metrics, asymmetry }) => {
  const knee = classifyKnee(metrics.knee_flexion);
  const foot = classifyFootStrike(metrics.foot_strike);
  const over = classifyOverstriding(metrics.overstriding);
  const vert = classifyVerticalOsc(metrics.vertical_oscillation);
  const asym = classifyAsymmetry(asymmetry);

  return (
    <View>
      <MetricBadge
        label="무릎 굴곡 각도 (평균)"
        value={`${metrics.knee_flexion.avg_angle.toFixed(1)}°`}
        status={knee.status}
        detail={knee.detail}
      />
      <MetricBadge
        label="발 착지 유형"
        value={FOOT_LABEL[foot.dominant]}
        status={foot.status}
        detail={foot.detail}
      />
      <MetricBadge
        label="오버스트라이드"
        value={`평균 ${metrics.overstriding.avg_distance.toFixed(2)}`}
        status={over.status}
        detail={over.detail}
      />
      <MetricBadge
        label="수직 진폭"
        value={metrics.vertical_oscillation.avg_value.toFixed(2)}
        status={vert.status}
        detail={vert.detail}
      />
      <MetricBadge
        label="좌우 비대칭"
        value={`${(asymmetry.strike_count_ratio * 100).toFixed(1)}%`}
        status={asym.status}
        detail={asym.detail}
      />
    </View>
  );
};
