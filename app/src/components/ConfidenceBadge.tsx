import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import type { Confidence } from '../services/api';

const CONFIDENCE_CONFIG: Record<
  Confidence,
  { color: string; label: string; description: string }
> = {
  high: {
    color: COLORS.SAFE,
    label: '높음',
    description: '입력 영상 품질이 우수하여 분석을 신뢰할 수 있습니다.',
  },
  medium: {
    color: COLORS.WARNING,
    label: '보통',
    description:
      '일부 조건이 권장 사양에 미치지 못합니다. 아래 경고를 확인해주세요.',
  },
  low: {
    color: COLORS.DANGER,
    label: '낮음',
    description:
      '여러 조건이 미흡합니다. 결과는 참고용으로만 사용하고 재촬영을 권장합니다.',
  },
};

export const ConfidenceBadge: React.FC<{ confidence: Confidence }> = ({
  confidence,
}) => {
  const config = CONFIDENCE_CONFIG[confidence];
  return (
    <View style={[styles.container, { backgroundColor: config.color }]}>
      <Text style={styles.label}>분석 신뢰도: {config.label}</Text>
      <Text style={styles.description}>{config.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  label: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  description: { color: 'white', fontSize: 12, marginTop: 4, opacity: 0.95 },
});
