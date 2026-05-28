import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { ModeToggle } from '../components/ModeToggle';
import { useMode } from '../context/ModeContext';
import { pickVideoFromFiles, pickVideoFromGallery } from '../services/videoPicker';
import { getUserHeightCm, setUserHeightCm } from '../services/storage';
import type { PickResult } from '../services/videoPicker';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { mode, selectedMemberId } = useMode();
  const insets = useSafeAreaInsets();

  const trainerMode = mode === 'trainer';
  const canStart = !trainerMode || !!selectedMemberId;

  const [heightInput, setHeightInput] = useState('');
  const [heightSaved, setHeightSaved] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const v = await getUserHeightCm();
      setHeightSaved(v);
      setHeightInput(v != null ? String(v) : '');
    })();
  }, []);

  const handleSaveHeight = useCallback(async () => {
    const trimmed = heightInput.trim();
    if (trimmed === '') {
      await setUserHeightCm(null);
      setHeightSaved(null);
      return;
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 80 || n > 250) {
      Alert.alert('', t('home.heightInvalid'));
      return;
    }
    await setUserHeightCm(n);
    setHeightSaved(n);
  }, [heightInput, t]);

  const handlePickResult = useCallback(
    (res: PickResult) => {
      switch (res.status) {
        case 'ok':
          navigation.navigate('Upload', { videoUri: res.uri });
          return;
        case 'cancelled':
          return;
        case 'portrait':
          Alert.alert('', t('home.portraitNotSupported'));
          return;
        case 'error':
          Alert.alert('', res.message ?? t('home.pickerError'));
          return;
      }
    },
    [navigation, t],
  );

  const handlePickGallery = useCallback(async () => {
    if (!canStart) {
      return;
    }
    handlePickResult(await pickVideoFromGallery());
  }, [canStart, handlePickResult]);

  const handlePickFiles = useCallback(async () => {
    if (!canStart) {
      return;
    }
    handlePickResult(await pickVideoFromFiles());
  }, [canStart, handlePickResult]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24 }}
    >
      <Text style={styles.title}>{t('home.title')}</Text>
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      <View style={{ height: 24 }} />
      <ModeToggle />

      {!trainerMode && (
        <View style={styles.heightCard}>
          <Text style={styles.heightLabel}>{t('home.heightLabel')}</Text>
          <View style={styles.heightRow}>
            <TextInput
              value={heightInput}
              onChangeText={setHeightInput}
              placeholder={t('home.heightPlaceholder')}
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              keyboardType="numeric"
              style={styles.heightInput}
            />
            <Pressable style={styles.heightSaveBtn} onPress={handleSaveHeight}>
              <Text style={styles.heightSaveBtnText}>{t('home.heightSave')}</Text>
            </Pressable>
          </View>
          <Text style={styles.heightHelper}>
            {heightSaved != null
              ? t('home.heightSavedHint', { cm: heightSaved })
              : t('home.heightHint')}
          </Text>
        </View>
      )}

      {trainerMode && (
        <>
          <Pressable
            style={styles.memberCard}
            onPress={() => navigation.navigate('MemberSelect')}
          >
            <Text style={styles.memberLabel}>{t('home.selectMember')}</Text>
            <Text style={styles.memberValue}>
              {selectedMemberId ?? t('home.noMemberSelected')}
            </Text>
          </Pressable>
          {selectedMemberId && (
            <Pressable
              style={styles.dashboardLink}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.dashboardLinkText}>
                {t('home.openDashboard')}
              </Text>
            </Pressable>
          )}
        </>
      )}

      <View style={{ flex: 1, minHeight: 40 }} />

      <Pressable
        style={[styles.startButton, !canStart && styles.buttonDisabled]}
        disabled={!canStart}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.startButtonText}>{t('home.startRecord')}</Text>
      </Pressable>

      <Pressable
        style={[styles.galleryButton, !canStart && styles.buttonDisabled]}
        disabled={!canStart}
        onPress={handlePickGallery}
      >
        <Text style={styles.galleryButtonText}>{t('home.pickFromGallery')}</Text>
      </Pressable>

      <Pressable
        style={styles.fileLink}
        disabled={!canStart}
        onPress={handlePickFiles}
      >
        <Text style={[styles.fileLinkText, !canStart && styles.fileLinkTextDisabled]}>
          {t('home.pickFromFiles')}
        </Text>
      </Pressable>

      {!canStart && (
        <Text style={styles.helperText}>{t('home.noMemberSelected')}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  memberCard: {
    marginTop: 12,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  memberLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  memberValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  startButton: {
    backgroundColor: COLORS.SAFE,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  galleryButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  galleryButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  fileLink: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fileLinkText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
  fileLinkTextDisabled: {
    color: '#9CA3AF',
  },
  dashboardLink: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    alignItems: 'center',
  },
  dashboardLinkText: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
  },
  heightCard: {
    marginTop: 12,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  heightLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 6,
  },
  heightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heightInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.TEXT,
    marginRight: 8,
  },
  heightSaveBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  heightSaveBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  heightHelper: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
  },
});
