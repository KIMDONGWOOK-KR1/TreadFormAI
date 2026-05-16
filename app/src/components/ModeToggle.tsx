import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../constants/colors';
import { useMode } from '../context/ModeContext';

export const ModeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { mode, setMode } = useMode();
  const isTrainer = mode === 'trainer';

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{t('home.trainerMode')}</Text>
      <Switch
        value={isTrainer}
        onValueChange={(v) => setMode(v ? 'trainer' : 'general')}
        thumbColor={isTrainer ? COLORS.PRIMARY : '#FFFFFF'}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
});
