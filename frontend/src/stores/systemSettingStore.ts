import { create } from 'zustand';
import { SystemSettingValue } from '../api/systemSetting';

interface SystemSettingState {
  timeRemaining: SystemSettingValue | null;
  setTimeRemaining: (value: SystemSettingValue | null) => void;
}

export const useSystemSettingStore = create<SystemSettingState>((set) => ({
  timeRemaining: null,
  setTimeRemaining: (value) => set({ timeRemaining: value }),
}));

