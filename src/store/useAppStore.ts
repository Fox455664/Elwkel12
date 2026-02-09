import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, TruckType, TrailerType, TruckDimensions, Driver, Load, UserProfile } from '@/types';

interface AppState {
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole | null) => void;
  
  countryCode: string;
  setCountryCode: (code: string) => void;
  
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  
  isPhoneVerified: boolean;
  setPhoneVerified: (verified: boolean) => void;
  
  // Registration Flow Data
  selectedTruckType: TruckType | null;
  setSelectedTruckType: (type: TruckType | null) => void;
  selectedTrailerType: TrailerType | null;
  setSelectedTrailerType: (type: TrailerType | null) => void;
  selectedDimensions: TruckDimensions | null;
  setSelectedDimensions: (dim: TruckDimensions | null) => void;
  
  // Runtime Data
  selectedLoad: Load | null;
  setSelectedLoad: (load: Load | null) => void;
  
  showFeedbackModal: boolean;
  setShowFeedbackModal: (show: boolean) => void;

  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  
  reset: () => void;
}

const initialState = {
  currentRole: null,
  countryCode: '+966',
  phoneNumber: '',
  isPhoneVerified: false,
  selectedTruckType: null,
  selectedTrailerType: null,
  selectedDimensions: null,
  selectedLoad: null,
  showFeedbackModal: false,
  userProfile: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setCurrentRole: (role) => set({ currentRole: role }),
      setCountryCode: (code) => set({ countryCode: code }),
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      setPhoneVerified: (verified) => set({ isPhoneVerified: verified }),
      
      setSelectedTruckType: (type) => set({ selectedTruckType: type }),
      setSelectedTrailerType: (type) => set({ selectedTrailerType: type }),
      setSelectedDimensions: (dim) => set({ selectedDimensions: dim }),
      
      setSelectedLoad: (load) => set({ selectedLoad: load }),
      setShowFeedbackModal: (show) => set({ showFeedbackModal: show }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'sas-transport-storage', // اسم المفتاح في LocalStorage
      partialize: (state) => ({ 
        // نحدد ما نريد حفظه فقط عند إعادة تحميل الصفحة
        currentRole: state.currentRole, 
        userProfile: state.userProfile,
        countryCode: state.countryCode
      }), 
    }
  )
);
