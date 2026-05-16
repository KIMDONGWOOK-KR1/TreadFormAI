import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Video, { type VideoRef } from 'react-native-video';
import Svg, { Circle, Line } from 'react-native-svg';

import { COLORS } from '../constants/colors';
import { useSlowMotionAtDanger } from '../hooks/useSlowMotionAtDanger';
import type { DangerTimestamp } from '../services/api';

interface Props {
  videoUrl: string;
  dangerTimestamps: DangerTimestamp[];
}

const { width: SCREEN_W } = Dimensions.get('window');
const TIMELINE_HEIGHT = 40;
const TIMELINE_WIDTH = SCREEN_W - 40;
const TIMELINE_PAD = 8;

export const VideoPlayerWithMarkers: React.FC<Props> = ({
  videoUrl,
  dangerTimestamps,
}) => {
  const videoRef = useRef<VideoRef>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [paused, setPaused] = useState(false);

  const { rate, handleProgress } = useSlowMotionAtDanger({
    dangerTimestamps,
    windowSec: 0.5,
  });

  // 함정 #2: duration 0 일 때 NaN 방지.
  const safeDuration = duration > 0 ? duration : 1;
  const progressX = (currentTime / safeDuration) * TIMELINE_WIDTH;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        rate={rate}
        paused={paused}
        onLoad={(meta) => setDuration(meta.duration)}
        onProgress={(p) => {
          setCurrentTime(p.currentTime);
          handleProgress(p.currentTime);
        }}
        resizeMode="contain"
      />

      {rate < 1.0 && (
        <View style={styles.slowMoBadge}>
          <Text style={styles.slowMoText}>0.5x 슬로우 모션</Text>
        </View>
      )}

      <View style={styles.timelineWrap}>
        <Svg width={TIMELINE_WIDTH} height={TIMELINE_HEIGHT}>
          <Line
            x1={TIMELINE_PAD}
            y1={TIMELINE_HEIGHT / 2}
            x2={TIMELINE_WIDTH - TIMELINE_PAD}
            y2={TIMELINE_HEIGHT / 2}
            stroke="#E5E7EB"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {duration > 0 && (
            <Line
              x1={TIMELINE_PAD}
              y1={TIMELINE_HEIGHT / 2}
              x2={Math.max(TIMELINE_PAD, progressX)}
              y2={TIMELINE_HEIGHT / 2}
              stroke={COLORS.PRIMARY}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
          {duration > 0 &&
            dangerTimestamps.map((d, i) => {
              const x = (d.time_sec / safeDuration) * TIMELINE_WIDTH;
              return (
                <Circle
                  key={`${d.time_sec}-${i}`}
                  cx={Math.min(Math.max(x, TIMELINE_PAD), TIMELINE_WIDTH - TIMELINE_PAD)}
                  cy={TIMELINE_HEIGHT / 2}
                  r={6}
                  fill={COLORS.DANGER}
                />
              );
            })}
        </Svg>
        <Text style={styles.timeLabel}>
          {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
        </Text>
      </View>

      <Pressable style={styles.playButton} onPress={() => setPaused((p) => !p)}>
        <Text style={styles.playButtonText}>{paused ? '재생' : '일시정지'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: 'black' },
  slowMoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  slowMoText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  timelineWrap: { paddingHorizontal: 20, paddingVertical: 6 },
  timeLabel: {
    fontSize: 11,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 2,
  },
  playButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    marginTop: 6,
  },
  playButtonText: { color: 'white', fontWeight: '700', fontSize: 14 },
});
