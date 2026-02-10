import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole, Load } from '@/types';

interface AppState {
  userProfile: UserProfile | null;
  currentRole: UserRole | null;
  phoneNumber: string;
  isPhoneVerified: boolean;
  selectedLoad: Load | null;
  showFeedbackModal: boolean;

  setUserProfile: (profile: UserProfile | null) => void;
  setCurrentRole: (role: UserRole | null) => void;
  setPhoneNumber: (phone: string) => void;
  setPhoneVerified: (verified: boolean) => void;
  setSelectedLoad: (load: Load | null) => void;
  setShowFeedbackModal: (show: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userProfile: null,
      currentRole: null,
      phoneNumber: '',
      isPhoneVerified: false,
      selectedLoad: null,
      showFeedbackModal: false,

      setUserProfile: (profile) => set({ userProfile: profile }),
      setCurrentRole: (role) => set({ currentRole: role }),
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      setPhoneVerified: (verified) => set({ isPhoneVerified: verified }),
      setSelectedLoad: (load) => set({ selectedLoad: load }),
      setShowFeedbackModal: (show) => set({ showFeedbackModal: show }),
      
      reset: () => set({
        userProfile: null,
        currentRole: null,
        phoneNumber: '',
        isPhoneVerified: false,
        selectedLoad: null,
        showFeedbackModal: false
      }),
    }),
    {
      name: 'sas-transport-storage',
      partialize: (state) => ({
        userProfile: state.userProfile,
        currentRole: state.currentRole,
      }),
    }
  )
);
