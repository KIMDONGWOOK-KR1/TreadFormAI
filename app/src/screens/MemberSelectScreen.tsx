import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { createMember, listMembers, type Member } from '../services/api';
import { useMode } from '../context/ModeContext';
import type { RootStackParamList } from '../navigation/types';

function parseHeight(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 80 || n > 250) {
    return Number.NaN;
  }
  return n;
}

export const MemberSelectScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { trainerId, selectedMemberId, setSelectedMemberId } = useMode();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    if (!trainerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await listMembers(trainerId);
      setMembers(list);
    } catch {
      Alert.alert('', '회원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSelect = async (member: Member) => {
    await setSelectedMemberId(member.member_id);
    navigation.goBack();
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || !trainerId) {
      return;
    }
    const parsedHeight = parseHeight(heightInput);
    if (Number.isNaN(parsedHeight)) {
      Alert.alert('', t('member.heightInvalid'));
      return;
    }
    setCreating(true);
    try {
      const member = await createMember(trimmed, trainerId, parsedHeight);
      setName('');
      setHeightInput('');
      setMembers((prev) => [...prev, member]);
      await setSelectedMemberId(member.member_id);
      navigation.goBack();
    } catch {
      Alert.alert('', '회원 등록에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addCard}>
        <Text style={styles.addTitle}>{t('member.addNew')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('member.namePlaceholder')}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          style={styles.input}
        />
        <TextInput
          value={heightInput}
          onChangeText={setHeightInput}
          placeholder={t('member.heightPlaceholder')}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          keyboardType="numeric"
          style={[styles.input, styles.inputSecondary]}
        />
        <Pressable
          style={[styles.addBtn, (!name.trim() || creating) && styles.btnDisabled]}
          disabled={!name.trim() || creating}
          onPress={handleCreate}
        >
          <Text style={styles.addBtnText}>{t('member.add')}</Text>
        </Pressable>
      </View>

      <Text style={styles.listTitle}>{t('member.listTitle')}</Text>

      <FlatList
        data={members}
        keyExtractor={(m) => m.member_id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('member.empty')}</Text>
        }
        renderItem={({ item }) => {
          const isSelected = item.member_id === selectedMemberId;
          return (
            <Pressable
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => handleSelect(item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.name}</Text>
                {item.height_cm != null && (
                  <Text style={styles.rowMeta}>
                    {t('member.heightLabel', { cm: item.height_cm })}
                  </Text>
                )}
              </View>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  addTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.TEXT,
  },
  inputSecondary: {
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: { color: 'white', fontWeight: '700' },
  btnDisabled: { backgroundColor: '#9CA3AF' },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    marginBottom: 8,
  },
  rowSelected: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: COLORS.SAFE,
  },
  rowName: { fontSize: 16, color: COLORS.TEXT, fontWeight: '600' },
  rowMeta: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  checkMark: { fontSize: 18, color: COLORS.SAFE, fontWeight: 'bold' },
});
