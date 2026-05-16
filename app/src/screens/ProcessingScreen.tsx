import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { POLL_INTERVAL_MS } from '../constants/api';
import { getAnalysisResult, normalizeApiError } from '../services/api';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

type Status =
  | { kind: 'polling'; elapsedSec: number }
  | { kind: 'failed'; messageKo: string };

export const ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>({ kind: 'polling', elapsedSec: 0 });
  const cancelledRef = useRef(false);
  const elapsedRef = useRef(0);

  const poll = useCallback(async () => {
    while (!cancelledRef.current) {
      try {
        const result = await getAnalysisResult(route.params.analysisId);
        if (cancelledRef.current) {
          return;
        }
        if (result.status === 'completed') {
          navigation.replace('Result', { result });
          return;
        }
        if (result.status === 'failed') {
          const code = result.error_code;
          const i18nKey = `errorCodes.${code ?? ''}`;
          const translated = code ? t(i18nKey, { defaultValue: '' }) : '';
          const messageKo =
            translated || result.message_ko || t('processing.failed');
          setStatus({ kind: 'failed', messageKo });
          return;
        }
      } catch (e) {
        const err = normalizeApiError(e);
        if (err.isNetwork) {
          // 일시 네트워크 오류는 폴링 계속.
        } else if (err.status === 404) {
          // 분석 ID 가 사라진 경우 (서버 재시작 등).
          setStatus({
            kind: 'failed',
            messageKo: '분석 정보를 찾을 수 없습니다.',
          });
          return;
        }
      }
      await new Promise<void>((resolve) =>
        setTimeout(() => resolve(), POLL_INTERVAL_MS),
      );
      elapsedRef.current += POLL_INTERVAL_MS / 1000;
      if (!cancelledRef.current) {
        setStatus({ kind: 'polling', elapsedSec: Math.floor(elapsedRef.current) });
      }
    }
  }, [navigation, route.params.analysisId, t]);

  useEffect(() => {
    cancelledRef.current = false;
    void poll();
    return () => {
      cancelledRef.current = true;
    };
  }, [poll]);

  if (status.kind === 'failed') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>{t('processing.failed')}</Text>
        <Text style={styles.errorMessage}>{status.messageKo}</Text>
        <Pressable
          style={styles.homeBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeBtnText}>홈으로 돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.SAFE} />
      <Text style={styles.title}>{t('processing.analyzing')}</Text>
      <Text style={styles.subtitle}>{t('processing.pleaseWait')}</Text>
      <Text style={styles.elapsed}>{status.elapsedSec}초 경과</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 10,
    textAlign: 'center',
  },
  elapsed: {
    marginTop: 18,
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'monospace',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.DANGER,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    color: COLORS.TEXT,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  homeBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  homeBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
