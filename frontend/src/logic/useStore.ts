import { create } from 'zustand'

type OptionType = {
    value: string;
    label: string;
};

interface StoreState {
    selectedSprints: OptionType[];
    selectedAreas: OptionType[];
    setSelectedSprints: (selectedSprints: OptionType[]) => void;
    setSelectedAreas: (selectedAreas: OptionType[]) => void;
  }

export const useStore = create<StoreState>((set) => ({
  selectedSprints: [],
  selectedAreas: [],
  setSelectedSprints: (selectedSprints: OptionType[]) => set({ selectedSprints }),
  setSelectedAreas: (selectedAreas: OptionType[]) => set({ selectedAreas }),
}))
