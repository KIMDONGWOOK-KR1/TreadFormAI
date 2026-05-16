import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Orientation from 'react-native-orientation-locker';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import { ARGuideOverlay } from '../components/ARGuideOverlay';
import { CaptureGuideModal } from '../components/CaptureGuideModal';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const TARGET_FPS = 30;

export const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const cameraRef = useRef<Camera>(null);
  const [guideVisible, setGuideVisible] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    { videoResolution: { width: TARGET_WIDTH, height: TARGET_HEIGHT } },
    { fps: TARGET_FPS },
  ]);

  const cameraPerm = useCameraPermission();
  const micPerm = useMicrophonePermission();

  useEffect(() => {
    Orientation.lockToLandscape();
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  useEffect(() => {
    if (!cameraPerm.hasPermission) {
      cameraPerm.requestPermission();
    }
    if (!micPerm.hasPermission) {
      micPerm.requestPermission();
    }
  }, [cameraPerm, micPerm]);

  const handleRecord = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) {
      return;
    }
    if (isRecording) {
      await cam.stopRecording();
      return;
    }
    setIsRecording(true);
    cam.startRecording({
      fileType: 'mp4',
      videoCodec: 'h264',
      onRecordingFinished: (video) => {
        setIsRecording(false);
        const uri = video.path.startsWith('file://')
          ? video.path
          : `file://${video.path}`;
        navigation.replace('Upload', { videoUri: uri });
      },
      onRecordingError: (error) => {
        setIsRecording(false);
        Alert.alert('녹화 오류', String(error.message ?? error));
      },
    });
  }, [isRecording, navigation]);

  if (guideVisible) {
    return (
      <CaptureGuideModal
        visible
        onConfirm={() => setGuideVisible(false)}
      />
    );
  }

  if (!cameraPerm.hasPermission || !micPerm.hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{t('camera.permissionDenied')}</Text>
        <Pressable
          style={styles.grantBtn}
          onPress={async () => {
            await cameraPerm.requestPermission();
            await micPerm.requestPermission();
          }}
        >
          <Text style={styles.grantText}>{t('camera.grantPermission')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{t('camera.noDevice')}</Text>
      </View>
    );
  }

  if (!format) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        fps={TARGET_FPS}
        isActive={true}
        video={true}
        audio={false}
      />
      <ARGuideOverlay />
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.recordBtn, isRecording && styles.recording]}
          onPress={handleRecord}
        >
          <View
            style={isRecording ? styles.recordIconStop : styles.recordIcon}
          />
          <Text style={styles.recordText}>
            {isRecording ? t('camera.stop') : t('camera.record')}
          </Text>
        </Pressable>
      </View>
      <View style={styles.formatChip}>
        <Text style={styles.formatText}>
          {format.videoWidth}×{format.videoHeight} @ {TARGET_FPS}fps
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centered: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: COLORS.TEXT,
    marginBottom: 18,
    textAlign: 'center',
  },
  grantBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  grantText: { color: 'white', fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SAFE,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  recording: { backgroundColor: COLORS.DANGER },
  recordIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'white',
    marginRight: 10,
  },
  recordIconStop: {
    width: 14,
    height: 14,
    backgroundColor: 'white',
    marginRight: 10,
  },
  recordText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  formatChip: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  formatText: { color: 'white', fontSize: 12 },
});
