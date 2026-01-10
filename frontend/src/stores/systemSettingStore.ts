import { create } from 'zustand';
import { SystemSettingValue } from '../api/systemSetting';

interface SystemSettingState {
  newCreatedProduct: SystemSettingValue | null;
  setNewCreatedProduct: (value: SystemSettingValue | null) => void;
  timeRemaining: SystemSettingValue | null;
  setTimeRemaining: (value: SystemSettingValue | null) => void;
}

export const useSystemSettingStore = create<SystemSettingState>((set) => ({
  newCreatedProduct: null,
  setNewCreatedProduct: (value) => set({ newCreatedProduct: value }),
  timeRemaining: null,
  setTimeRemaining: (value) => set({ timeRemaining: value }),
}));

