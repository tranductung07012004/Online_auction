import { create } from 'zustand';

interface NavigationState {
  // Drawer state
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // Initial state
  drawerOpen: false,
  
  // Actions
  setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
  
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
}));

