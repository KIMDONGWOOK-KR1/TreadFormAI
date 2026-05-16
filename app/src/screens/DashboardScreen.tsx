import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../constants/colors';
import { ProgressChart } from '../components/ProgressChart';
import { getMemberHistory } from '../services/api';
import { useMode } from '../context/ModeContext';
import type {
  AnalysisSummary,
  AsymmetryResult,
  Confidence,
} from '../services/api';

interface HistoryEntry {
  analysis_id: string;
  completed_at: string;
  summary: AnalysisSummary;
  asymmetry: AsymmetryResult;
  confidence: Confidence;
}

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { selectedMemberId } = useMode();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!selectedMemberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getMemberHistory(selectedMemberId);
      setHistory((data as { history: HistoryEntry[] }).history);
    } catch {
      setError('이력을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedMemberId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!selectedMemberId) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>회원을 먼저 선택해주세요.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{error}</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>분석 이력이 없습니다.</Text>
      </View>
    );
  }

  const labels = history.map((_, i) => `${i + 1}회`);
  const cadence = history.map((h) => h.summary.cadence_spm);
  const dangerCount = history.map((h) => h.summary.danger_count);
  const asymRatio = history.map((h) =>
    Math.round(h.asymmetry.strike_count_ratio * 1000) / 10,
  );

  const firstDanger = dangerCount[0];
  const lastDanger = dangerCount.at(-1) ?? firstDanger;
  const dangerDelta = lastDanger - firstDanger;
  const dangerSummary =
    history.length >= 2
      ? dangerDelta < 0
        ? `첫 회 ${firstDanger}회 → 최근 ${lastDanger}회로 위험 구간이 감소했습니다.`
        : dangerDelta > 0
        ? `첫 회 ${firstDanger}회 → 최근 ${lastDanger}회로 위험 구간이 증가했습니다.`
        : `위험 구간 횟수가 ${firstDanger}회로 동일하게 유지되었습니다.`
      : '추가 분석이 누적되면 변화 추이가 표시됩니다.';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
    >
      <Text style={styles.header}>비포/애프터 누적 분석</Text>

      <ProgressChart
        title="케이던스 (분당 보수)"
        labels={labels}
        values={cadence}
        unit=" spm"
        decimals={0}
      />
      <ProgressChart
        title="위험 구간 발생 횟수"
        labels={labels}
        values={dangerCount}
        unit="회"
        decimals={0}
      />
      <ProgressChart
        title="좌우 착지 비대칭 (%)"
        labels={labels}
        values={asymRatio}
        unit="%"
        decimals={1}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>PT 효과 요약</Text>
        <Text style={styles.summaryText}>{dangerSummary}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  center: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  empty: { color: COLORS.TEXT_SECONDARY, fontSize: 14 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 20,
  },
  summary: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
    color: COLORS.PRIMARY,
  },
  summaryText: { fontSize: 14, lineHeight: 20, color: COLORS.TEXT },
});
