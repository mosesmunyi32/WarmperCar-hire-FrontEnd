import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserResponse } from "@/types";
import Cookies from "js-cookie";

interface AuthStore {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setUser: (user: UserResponse) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

const cookieStorage = {
  getItem: (name: string) => Cookies.get(name) ?? null,
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { expires: 7 });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({hasHydrated: value}),
      setUser: (user: UserResponse) =>
        set({
          user,
          isAuthenticated: true,
        }),
      setToken: (token: string) => {
        set({ token });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    },
  ),
);

export default useAuthStore;
