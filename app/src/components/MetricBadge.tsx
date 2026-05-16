import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';

export type MetricStatus = 'safe' | 'warning' | 'danger';

interface Props {
  label: string;
  value: string;
  status: MetricStatus;
  detail?: string;
}

const STATUS_CONFIG: Record<MetricStatus, { color: string; text: string }> = {
  safe: { color: COLORS.SAFE, text: '안전' },
  warning: { color: COLORS.WARNING, text: '경고' },
  danger: { color: COLORS.DANGER, text: '위험' },
};

export const MetricBadge: React.FC<Props> = ({ label, value, status, detail }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: config.color }]}>{value}</Text>
        <Text style={styles.detail}>{detail ?? config.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 14,
  },
  content: { flex: 1 },
  label: { fontSize: 13, color: COLORS.TEXT_SECONDARY },
  value: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  detail: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
});
