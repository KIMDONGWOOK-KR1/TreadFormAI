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

export const MemberSelectScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { trainerId, selectedMemberId, setSelectedMemberId } = useMode();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
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
    } catch (e) {
      Alert.alert('', '회원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSelect = async (member: Member) => {
    await setSelectedMemberId(member.id);
    navigation.goBack();
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || !trainerId) {
      return;
    }
    setCreating(true);
    try {
      const member = await createMember(trimmed, trainerId);
      setName('');
      setMembers((prev) => [...prev, member]);
      await setSelectedMemberId(member.id);
      navigation.goBack();
    } catch (e) {
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
        <View style={styles.addRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('member.namePlaceholder')}
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            style={styles.input}
          />
          <Pressable
            style={[styles.addBtn, (!name.trim() || creating) && styles.btnDisabled]}
            disabled={!name.trim() || creating}
            onPress={handleCreate}
          >
            <Text style={styles.addBtnText}>{t('member.add')}</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.listTitle}>{t('member.listTitle')}</Text>

      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('member.empty')}</Text>
        }
        renderItem={({ item }) => {
          const isSelected = item.id === selectedMemberId;
          return (
            <Pressable
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.rowName}>{item.name}</Text>
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
  addRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.TEXT,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
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
  checkMark: { fontSize: 18, color: COLORS.SAFE, fontWeight: 'bold' },
});
