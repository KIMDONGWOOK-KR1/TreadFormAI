import React, { createContext, useContext, useEffect, useState } from 'react';

import * as storage from '../services/storage';

type Mode = 'general' | 'trainer';

interface ModeContextValue {
  mode: Mode;
  setMode: (m: Mode) => Promise<void>;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => Promise<void>;
  trainerId: string | null;
  setTrainerId: (id: string) => Promise<void>;
  hydrated: boolean;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

const DEV_DEFAULT_TRAINER_ID = 'trainer-dev';

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>('general');
  const [selectedMemberId, setSelectedMemberIdState] = useState<string | null>(null);
  const [trainerId, setTrainerIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, t, sm] = await Promise.all([
        storage.getMode(),
        storage.getTrainerId(),
        storage.getSelectedMemberId(),
      ]);
      setModeState(m);
      if (t) {
        setTrainerIdState(t);
      } else if (__DEV__) {
        await storage.setTrainerId(DEV_DEFAULT_TRAINER_ID);
        setTrainerIdState(DEV_DEFAULT_TRAINER_ID);
      }
      setSelectedMemberIdState(sm);
      setHydrated(true);
    })();
  }, []);

  const setMode = async (m: Mode) => {
    setModeState(m);
    await storage.setMode(m);
    if (m === 'general') {
      await storage.setSelectedMemberId(null);
      setSelectedMemberIdState(null);
    }
  };

  const setSelectedMemberId = async (id: string | null) => {
    setSelectedMemberIdState(id);
    await storage.setSelectedMemberId(id);
  };

  const setTrainerId = async (id: string) => {
    setTrainerIdState(id);
    await storage.setTrainerId(id);
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        selectedMemberId,
        setSelectedMemberId,
        trainerId,
        setTrainerId,
        hydrated,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ModeContextValue => {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useMode must be inside ModeProvider');
  }
  return ctx;
};
