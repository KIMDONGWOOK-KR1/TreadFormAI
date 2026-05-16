import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AnalysisWarning } from '../services/api';

export const WarningList: React.FC<{ warnings: AnalysisWarning[] }> = ({
  warnings,
}) => {
  // 함정 #9: 빈 배열이면 카드 자체를 숨겨 노이즈 제거.
  if (warnings.length === 0) {
    return null;
  }
  return (
    <View style={styles.card}>
      <Text style={styles.header}>입력 영상 경고 ({warnings.length}건)</Text>
      {warnings.map((w) => (
        <View key={w.code} style={styles.row}>
          <Text style={styles.bullet}>·</Text>
          <Text style={styles.message}>{w.message_ko}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#EAB308',
  },
  header: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#92400E' },
  row: { flexDirection: 'row', marginVertical: 3 },
  bullet: { width: 12, color: '#92400E' },
  message: { flex: 1, fontSize: 13, color: '#78350F', lineHeight: 18 },
});
