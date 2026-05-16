import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { COLORS } from '../constants/colors';

interface Props {
  title: string;
  labels: string[];
  values: number[];
  unit?: string;
  decimals?: number;
}

const { width: SCREEN_W } = Dimensions.get('window');

export const ProgressChart: React.FC<Props> = ({
  title,
  labels,
  values,
  unit = '',
  decimals = 1,
}) => {
  // 함정 #4: 데이터 1개면 차트가 깨짐.
  if (values.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>
          비교 데이터가 부족합니다 ({values.length}회). 최소 2회 분석 필요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{ labels, datasets: [{ data: values }] }}
        width={SCREEN_W - 40}
        height={200}
        yAxisSuffix={unit}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: decimals,
          color: (opacity = 1) => `rgba(46, 117, 182, ${opacity})`,
          labelColor: () => '#374151',
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.TEXT,
  },
  empty: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    paddingVertical: 30,
    textAlign: 'center',
  },
  chart: { marginVertical: 8, borderRadius: 12 },
});
