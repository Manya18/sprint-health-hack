import { create } from 'zustand'

type OptionType = {
    value: string;
    label: string;
};

interface StoreState {
    selectedSprints: OptionType[];
    selectedAreas: OptionType[];
    timelineEnd: Date;
    setSelectedSprints: (selectedSprints: OptionType[]) => void;
    setSelectedAreas: (selectedAreas: OptionType[]) => void;
    setTimelineEnd: (timelineEnd: Date) => void;
  }

export const useStore = create<StoreState>((set) => ({
  selectedSprints: [],
  selectedAreas: [],
  timelineEnd: new Date(),
  setSelectedSprints: (selectedSprints: OptionType[]) => set({ selectedSprints }),
  setSelectedAreas: (selectedAreas: OptionType[]) => set({ selectedAreas }),
  setTimelineEnd: (timelineEnd: Date) => set({ timelineEnd }),
}))
