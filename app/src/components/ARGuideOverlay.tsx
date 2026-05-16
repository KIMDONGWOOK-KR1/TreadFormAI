import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

const GUIDE_COLOR = 'rgba(34, 197, 94, 0.85)';

export const ARGuideOverlay: React.FC = () => {
  const { width: W, height: H } = useWindowDimensions();

  const beltY = H * 0.78;
  const hipBoxX = W * 0.4;
  const hipBoxY = H * 0.35;
  const hipBoxW = W * 0.2;
  const hipBoxH = H * 0.18;

  return (
    <View pointerEvents="none" style={[styles.layer, { width: W, height: H }]}>
      <Svg width={W} height={H}>
        <Line
          x1={0}
          y1={beltY}
          x2={W}
          y2={beltY}
          stroke={GUIDE_COLOR}
          strokeWidth={3}
          strokeDasharray="12,6"
        />
        <Rect
          x={hipBoxX}
          y={hipBoxY}
          width={hipBoxW}
          height={hipBoxH}
          stroke={GUIDE_COLOR}
          strokeWidth={2}
          fill="none"
          strokeDasharray="6,4"
        />
      </Svg>
      <Text style={[styles.label, { top: beltY - 24, left: 16 }]}>
        트레드밀 벨트
      </Text>
      <Text style={[styles.label, { top: hipBoxY - 20, left: hipBoxX }]}>
        골반 위치
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  label: {
    position: 'absolute',
    color: GUIDE_COLOR,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
