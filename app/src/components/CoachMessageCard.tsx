import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';

interface Props {
  message: string;
}

export const CoachMessageCard: React.FC<Props> = ({ message }) => (
  <View style={styles.card}>
    <Text style={styles.header}>AI 코칭 피드백</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    marginVertical: 16,
  },
  header: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT,
  },
});
