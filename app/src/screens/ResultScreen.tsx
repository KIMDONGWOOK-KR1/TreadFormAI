import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { BASE_URL } from '../constants/api';
import { CoachMessageCard } from '../components/CoachMessageCard';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { MetricsSummary } from '../components/MetricsSummary';
import { VideoPlayerWithMarkers } from '../components/VideoPlayerWithMarkers';
import { WarningList } from '../components/WarningList';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { result } = route.params;
  const { analysis_result: ar } = result;

  const fullVideoUrl = `${BASE_URL}${result.rendered_video_url}`;
  const csvUrl = `${BASE_URL}${result.csv_report_url}`;

  const isLowConfidence = ar.confidence === 'low';
  const contentOpacity = isLowConfidence ? 0.4 : 1.0;

  const handleShare = async () => {
    try {
      await Share.open({
        title: '러닝 자세 분석 결과',
        message: result.coach_message,
        url: csvUrl,
      });
    } catch {
      // 사용자가 공유 시트 취소.
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <Text style={styles.header}>러닝 자세 분석 결과</Text>

      <ConfidenceBadge confidence={ar.confidence} />
      <WarningList warnings={ar.warnings} />

      <View style={{ opacity: contentOpacity }} pointerEvents={isLowConfidence ? 'box-none' : 'auto'}>
        {isLowConfidence && (
          <View style={styles.lowBanner}>
            <Text style={styles.lowBannerText}>
              참고용 — 재촬영 후 다시 분석해주세요
            </Text>
          </View>
        )}

        <VideoPlayerWithMarkers
          videoUrl={fullVideoUrl}
          dangerTimestamps={ar.danger_timestamps}
        />

        <View style={styles.section}>
          <CoachMessageCard message={result.coach_message} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>분석 결과 요약</Text>
          <MetricsSummary metrics={ar.metrics} asymmetry={ar.asymmetry} />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.btn, styles.shareBtn]} onPress={handleShare}>
          <Text style={styles.btnText}>결과 공유</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.homeBtn]}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.btnText}>처음으로</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 20,
    color: COLORS.PRIMARY,
  },
  section: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12, color: COLORS.TEXT },
  buttonRow: { flexDirection: 'row', padding: 20, gap: 10 },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareBtn: { backgroundColor: COLORS.PRIMARY },
  homeBtn: { backgroundColor: COLORS.TEXT_SECONDARY },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  lowBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.DANGER,
    borderRadius: 6,
  },
  lowBannerText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});
