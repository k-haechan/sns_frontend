import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  memberId: number | null;
  username: string | null;
  profileImageUrl: string | null;
  realName: string | null;
  _hasHydrated: boolean;
  setAuth: (data: { memberId: number; username: string; profileImageUrl: string; realName: string }) => void;
  resetAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      memberId: null,
      username: null,
      profileImageUrl: null,
      realName: null,
      _hasHydrated: false,
      setAuth: (data) => set({ ...data }),
      resetAuth: () => set({ memberId: null, username: null, profileImageUrl: null, realName: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
); 