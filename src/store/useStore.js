import { create } from 'zustand';

const useStore = create((set) => ({
  isSidebarOpen: window.innerWidth > 768,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));

export default useStore;
