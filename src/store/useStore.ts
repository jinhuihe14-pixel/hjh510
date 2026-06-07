import { create } from 'zustand';
import type {
  AppState,
  RoomConfig,
  PlacedComponent,
  CabinetComponent,
  LightingMode,
  AppStateSnapshot,
  DesignScheme,
} from '@/types';
import { defaultRoom } from '@/data/rooms';
import { calculateQuote } from '@/utils/quote';
import { allComponents } from '@/data/components';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialState = () => {
  const initialComponents: PlacedComponent[] = [
    {
      id: generateId(),
      componentId: 'cabinet-600',
      position: { x: -1.2, y: 0, z: -1.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      materialId: 'white-melamine',
      color: '#FAFAFA',
      doorStyleId: 'flat',
    },
    {
      id: generateId(),
      componentId: 'cabinet-800',
      position: { x: -0.5, y: 0, z: -1.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      materialId: 'walnut-dark',
      color: '#6D4C41',
      doorStyleId: 'molded',
    },
    {
      id: generateId(),
      componentId: 'cabinet-1000',
      position: { x: 0.7, y: 0, z: -1.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      materialId: 'oak',
      color: '#D7CCC8',
      doorStyleId: 'flat',
    },
  ];

  const initialQuote = calculateQuote(initialComponents);

  return {
    room: defaultRoom,
    components: initialComponents,
    selectedComponentId: null,
    draggingComponent: null,
    hoverPosition: null,
    draggingPlacedId: null,
    resizingId: null,
    resizeHandle: null as 'left' | 'right' | 'top' | null,
    lightingMode: 'day' as const,
    schemes: [],
    compareMode: false,
    compareSchemes: [],
    quote: initialQuote,
    undoStack: [],
    redoStack: [],
  };
};

export const useStore = create<AppState>((set, get) => ({
  ...createInitialState(),

  setRoom: (room: RoomConfig) => {
    get().saveState();
    set({ room });
  },

  addComponent: (component: CabinetComponent, position: { x: number; y: number; z: number }) => {
    get().saveState();
    const newComp: PlacedComponent = {
      id: generateId(),
      componentId: component.id,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      materialId: component.defaultMaterial,
      color: '#8B7355',
      doorStyleId: 'flat',
    };
    set((state) => {
      const newComponents = [...state.components, newComp];
      const newQuote = calculateQuote(newComponents);
      return {
        components: newComponents,
        selectedComponentId: newComp.id,
        quote: newQuote,
        draggingComponent: null,
        hoverPosition: null,
      };
    });
  },

  removeComponent: (id: string) => {
    get().saveState();
    set((state) => {
      const newComponents = state.components.filter((c) => c.id !== id);
      const newQuote = calculateQuote(newComponents);
      return {
        components: newComponents,
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        quote: newQuote,
      };
    });
  },

  updateComponent: (id: string, updates: Partial<PlacedComponent>, saveHistory = true) => {
    if (saveHistory) {
      get().saveState();
    }
    set((state) => {
      const newComponents = state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      const newQuote = calculateQuote(newComponents);
      return { components: newComponents, quote: newQuote };
    });
  },

  selectComponent: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  setDraggingComponent: (component: CabinetComponent | null) => {
    set({ draggingComponent: component });
  },

  setHoverPosition: (position: { x: number; z: number } | null) => {
    set({ hoverPosition: position });
  },

  setDraggingPlacedId: (id: string | null) => {
    set({ draggingPlacedId: id });
  },

  setResizingId: (id: string | null) => {
    set({ resizingId: id });
  },

  setResizeHandle: (handle: 'left' | 'right' | 'top' | null) => {
    set({ resizeHandle: handle });
  },

  setLightingMode: (mode: LightingMode) => {
    set({ lightingMode: mode });
  },

  saveScheme: (name: string) => {
    const state = get();
    const scheme: DesignScheme = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      room: { ...state.room },
      components: state.components.map((c) => ({ ...c })),
      lightingMode: state.lightingMode,
    };
    set((s) => ({ schemes: [...s.schemes, scheme] }));
    return scheme.id;
  },

  deleteScheme: (id: string) => {
    set((state) => ({
      schemes: state.schemes.filter((s) => s.id !== id),
      compareSchemes: state.compareSchemes.filter((sid) => sid !== id),
    }));
  },

  loadScheme: (id: string) => {
    const scheme = get().schemes.find((s) => s.id === id);
    if (scheme) {
      const newComponents = scheme.components.map((c) => ({ ...c }));
      const newQuote = calculateQuote(newComponents);
      set({
        room: { ...scheme.room },
        components: newComponents,
        lightingMode: scheme.lightingMode,
        selectedComponentId: null,
        compareMode: false,
        quote: newQuote,
      });
    }
  },

  setCompareMode: (active: boolean) => {
    set({ compareMode: active });
  },

  toggleCompareScheme: (id: string) => {
    set((state) => {
      const isIncluded = state.compareSchemes.includes(id);
      let newCompareSchemes: string[];
      if (isIncluded) {
        newCompareSchemes = state.compareSchemes.filter((sid) => sid !== id);
      } else if (state.compareSchemes.length < 4) {
        newCompareSchemes = [...state.compareSchemes, id];
      } else {
        newCompareSchemes = state.compareSchemes;
      }
      return { compareSchemes: newCompareSchemes };
    });
  },

  saveState: () => {
    const state = get();
    const snapshot: AppStateSnapshot = {
      room: { ...state.room },
      components: state.components.map((c) => ({ ...c })),
      selectedComponentId: state.selectedComponentId,
    };
    set((s) => ({
      undoStack: [...s.undoStack, snapshot].slice(-50),
      redoStack: [],
    }));
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const prevState = state.undoStack[state.undoStack.length - 1];
    const currentSnapshot: AppStateSnapshot = {
      room: { ...state.room },
      components: state.components.map((c) => ({ ...c })),
      selectedComponentId: state.selectedComponentId,
    };

    set({
      room: prevState.room,
      components: prevState.components,
      selectedComponentId: prevState.selectedComponentId,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentSnapshot],
      quote: calculateQuote(prevState.components),
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const nextState = state.redoStack[state.redoStack.length - 1];
    const currentSnapshot: AppStateSnapshot = {
      room: { ...state.room },
      components: state.components.map((c) => ({ ...c })),
      selectedComponentId: state.selectedComponentId,
    };

    set({
      room: nextState.room,
      components: nextState.components,
      selectedComponentId: nextState.selectedComponentId,
      undoStack: [...state.undoStack, currentSnapshot],
      redoStack: state.redoStack.slice(0, -1),
      quote: calculateQuote(nextState.components),
    });
  },

  recalculateQuote: () => {
    const state = get();
    set({ quote: calculateQuote(state.components) });
  },
}));
