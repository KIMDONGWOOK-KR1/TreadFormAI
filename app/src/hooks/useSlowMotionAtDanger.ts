import { useCallback, useRef, useState } from 'react';

import type { DangerTimestamp } from '../services/api';

interface Params {
  dangerTimestamps: DangerTimestamp[];
  windowSec?: number;
  debounceSec?: number;
}

/**
 * 현재 재생 시점이 Danger 구간(±windowSec) 안이면 0.5x, 아니면 1.0x.
 * 함정 #6: 인접 Danger 끼리 너무 가까우면 깜빡임 → debounceSec 미만의 rate 변경은 무시.
 */
export function useSlowMotionAtDanger({
  dangerTimestamps,
  windowSec = 0.5,
  debounceSec = 0.3,
}: Params) {
  const [rate, setRate] = useState(1.0);
  const lastChangeRef = useRef(0);

  const handleProgress = useCallback(
    (currentSec: number) => {
      const inDanger = dangerTimestamps.some(
        (d) => Math.abs(d.time_sec - currentSec) < windowSec,
      );
      const target = inDanger ? 0.5 : 1.0;
      if (target === rate) {
        return;
      }
      if (currentSec - lastChangeRef.current < debounceSec) {
        return;
      }
      lastChangeRef.current = currentSec;
      setRate(target);
    },
    [dangerTimestamps, windowSec, debounceSec, rate],
  );

  return { rate, handleProgress };
}
