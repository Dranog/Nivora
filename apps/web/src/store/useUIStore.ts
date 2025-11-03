// apps/web/src/store/useUIStore.ts
import { create } from "zustand";

type PanelId = "content" | "earnings" | "marketing" | "crm" | "growth" | "settings" | "analytics";

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  activeDrawer: string | null;
  activePanel?: PanelId;
}
interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  openDrawer: (id?: string) => void;
  closeDrawer: () => void;
  openPanel: (id: PanelId) => void;
  closePanel: () => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  sidebarOpen: true,
  activeModal: null,
  activeDrawer: null,
  activePanel: undefined,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  openDrawer: (id) => set({ activeDrawer: id ?? "panel" }),
  closeDrawer: () => set({ activeDrawer: null }),

  openPanel: (id) => set({ activePanel: id, activeDrawer: "panel" }),
  closePanel: () => set({ activePanel: undefined, activeDrawer: null }),
}));
