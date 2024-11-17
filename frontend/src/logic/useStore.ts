import { create } from 'zustand';

type OptionType = {
  value: string;
  label: string;
};

type ChartType = {
  id: string;
  type: string;
  data: any;
  name: string;
  xAxisTitle: string;
  yAxisTitle: string;
  title: string;
  gridPosition: { x: number; y: number; w: number; h: number };
};

interface StoreState {
  selectedSprints: OptionType[];
  selectedAreas: OptionType[];
  timelineEnd: Date;
  setSelectedSprints: (selectedSprints: OptionType[]) => void;
  setSelectedAreas: (selectedAreas: OptionType[]) => void;
  setTimelineEnd: (timelineEnd: Date) => void;
  chartsBase: React.ReactNode[];
  addChart: (newCharts: React.ReactNode[]) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedSprints: [],
  selectedAreas: [],
  timelineEnd: new Date(),
  setSelectedSprints: (selectedSprints: OptionType[]) => set({ selectedSprints }),
  setSelectedAreas: (selectedAreas: OptionType[]) => set({ selectedAreas }),
  setTimelineEnd: (timelineEnd: Date) => set({ timelineEnd }),
  chartsBase: [],
  addChart: (newCharts) => set((state) => ({
    chartsBase: [...state.chartsBase, ...newCharts],
  })),
}));

