import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { normalizeApiError, uploadVideo } from '../services/api';
import { useMode } from '../context/ModeContext';
import { getUserHeightCm } from '../services/storage';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

type Status =
  | { kind: 'preparing' }
  | { kind: 'uploading'; percent: number }
  | { kind: 'failed'; messageKo: string };

export const UploadScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { mode, selectedMemberId } = useMode();
  const [status, setStatus] = useState<Status>({ kind: 'preparing' });
  const startedRef = useRef(false);

  const start = useCallback(async () => {
    setStatus({ kind: 'uploading', percent: 0 });
    try {
      // 일반 모드: 로컬 프로필 신장 전송. 트레이너 모드: 회원 등록 시 저장된
      // height_cm 을 서버가 자동으로 사용하므로 form 에 첨부 불필요.
      const heightCm = mode === 'general' ? await getUserHeightCm() : null;
      const result = await uploadVideo(
        route.params.videoUri,
        {
          memberId: selectedMemberId ?? undefined,
          heightCm,
        },
        (percent) => setStatus({ kind: 'uploading', percent }),
      );
      navigation.replace('Processing', { analysisId: result.analysis_id });
    } catch (e) {
      const err = normalizeApiError(e);
      let messageKo: string;
      if (err.isNetwork) {
        messageKo = t('errorCodes._network');
      } else if (err.error_code) {
        const i18nKey = `errorCodes.${err.error_code}`;
        const translated = t(i18nKey, { defaultValue: '' });
        messageKo = translated || err.message_ko || t('errorCodes._default');
      } else {
        messageKo = err.message_ko || t('errorCodes._default');
      }
      setStatus({ kind: 'failed', messageKo });
    }
  }, [mode, navigation, route.params.videoUri, selectedMemberId, t]);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void start();
  }, [start]);

  const handleRetry = () => {
    startedRef.current = false;
    void start();
  };

  const handleBackHome = () => {
    navigation.popToTop();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>{t('upload.title')}</Text>

      {status.kind === 'preparing' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.status}>{t('upload.preparing')}</Text>
        </View>
      )}

      {status.kind === 'uploading' && (
        <View style={styles.center}>
          <Text style={styles.percent}>{status.percent}%</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${status.percent}%` }]} />
          </View>
          <Text style={styles.status}>{t('upload.uploading')}</Text>
        </View>
      )}

      {status.kind === 'failed' && (
        <View style={styles.center}>
          <Text style={styles.errorMessage}>{status.messageKo}</Text>
          <Pressable style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryText}>{t('upload.retry')}</Text>
          </Pressable>
          <Pressable style={styles.linkBtn} onPress={handleBackHome}>
            <Text style={styles.linkText}>홈으로 돌아가기</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  percent: { fontSize: 48, fontWeight: 'bold', color: COLORS.SAFE, marginBottom: 24 },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barFill: { height: '100%', backgroundColor: COLORS.SAFE },
  status: { fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 6 },
  errorMessage: {
    fontSize: 16,
    color: COLORS.TEXT,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  retryBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: { color: 'white', fontSize: 16, fontWeight: '700' },
  linkBtn: { marginTop: 14, padding: 10 },
  linkText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
