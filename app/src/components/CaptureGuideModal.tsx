import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../constants/colors';

interface Props {
  visible: boolean;
  onConfirm: () => void;
}

export const CaptureGuideModal: React.FC<Props> = ({ visible, onConfirm }) => {
  const { t } = useTranslation();

  const checklist = t('captureGuide.checklist', {
    returnObjects: true,
  }) as string[];
  const settings = t('captureGuide.settings', {
    returnObjects: true,
  }) as string[];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onConfirm}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{t('captureGuide.title')}</Text>

          <View style={styles.section}>
            {checklist.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>{t('captureGuide.settingsTitle')}</Text>
          <View style={styles.section}>
            {settings.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.paceCard}>
            <Text style={styles.paceTitle}>{t('captureGuide.paceGuide.title')}</Text>
            <Text style={styles.paceRec}>
              {t('captureGuide.paceGuide.recommendation')}
            </Text>
            <Text style={styles.paceWarn}>
              {t('captureGuide.paceGuide.warningFast')}
            </Text>
            <Text style={styles.paceWarn}>
              {t('captureGuide.paceGuide.warningSlow')}
            </Text>
          </View>
        </ScrollView>
        <Pressable style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>{t('captureGuide.confirm')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  scroll: { padding: 24, paddingBottom: 24 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginTop: 8,
    marginBottom: 8,
  },
  section: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bullet: {
    fontSize: 16,
    color: COLORS.SAFE,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.TEXT,
  },
  paceCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  paceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  paceRec: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 6,
    fontWeight: '600',
  },
  paceWarn: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 18,
  },
  confirmBtn: {
    margin: 20,
    backgroundColor: COLORS.SAFE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
