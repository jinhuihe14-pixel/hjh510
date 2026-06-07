export type RoomType = 'master' | 'second' | 'walkin';

export interface RoomConfig {
  id: string;
  name: string;
  type: RoomType;
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorColor: string;
}

export type ComponentCategory = 'cabinet' | 'door' | 'hardware' | 'shelf';

export interface CabinetComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  width: number;
  height: number;
  depth: number;
  price: number;
  defaultMaterial: string;
  description?: string;
}

export interface PlacedComponent {
  id: string;
  componentId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  materialId: string;
  color: string;
  doorStyleId?: string;
  shelves?: PlacedShelf[];
  hardware?: PlacedHardware[];
}

export interface PlacedShelf {
  id: string;
  type: string;
  positionY: number;
  width: number;
  depth: number;
}

export interface PlacedHardware {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
}

export interface Material {
  id: string;
  name: string;
  category: 'board' | 'door' | 'hardware';
  color: string;
  texture?: string;
  roughness: number;
  metalness: number;
  pricePerSqm: number;
}

export interface DoorStyle {
  id: string;
  name: string;
  type: 'flat' | 'molded' | 'louvered' | 'glass' | 'sliding';
  description: string;
  priceMultiplier: number;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface QuoteResult {
  boardArea: number;
  boardPrice: number;
  doorPrice: number;
  hardwareItems: QuoteItem[];
  hardwareTotal: number;
  shelfPrice: number;
  laborPrice: number;
  totalPrice: number;
}

export type LightingMode = 'day' | 'evening';

export interface DesignScheme {
  id: string;
  name: string;
  createdAt: number;
  room: RoomConfig;
  components: PlacedComponent[];
  lightingMode: LightingMode;
  thumbnail?: string;
}

export interface AppState {
  // 状态
  room: RoomConfig;
  components: PlacedComponent[];
  selectedComponentId: string | null;
  draggingComponent: CabinetComponent | null;
  hoverPosition: { x: number; z: number } | null;
  draggingPlacedId: string | null;
  resizingId: string | null;
  resizeHandle: 'left' | 'right' | 'top' | null;
  lightingMode: LightingMode;
  schemes: DesignScheme[];
  compareMode: boolean;
  compareSchemes: string[];
  quote: QuoteResult;
  undoStack: AppStateSnapshot[];
  redoStack: AppStateSnapshot[];

  // 方法
  setRoom: (room: RoomConfig) => void;
  addComponent: (component: CabinetComponent, position: { x: number; y: number; z: number }) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<PlacedComponent>, saveHistory?: boolean) => void;
  selectComponent: (id: string | null) => void;
  setDraggingComponent: (component: CabinetComponent | null) => void;
  setHoverPosition: (position: { x: number; z: number } | null) => void;
  setDraggingPlacedId: (id: string | null) => void;
  setResizingId: (id: string | null) => void;
  setResizeHandle: (handle: 'left' | 'right' | 'top' | null) => void;
  setLightingMode: (mode: LightingMode) => void;
  saveScheme: (name: string) => string;
  deleteScheme: (id: string) => void;
  loadScheme: (id: string) => void;
  setCompareMode: (active: boolean) => void;
  toggleCompareScheme: (id: string) => void;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  recalculateQuote: () => void;
}

export interface AppStateSnapshot {
  room: RoomConfig;
  components: PlacedComponent[];
  selectedComponentId: string | null;
}

export type ViewMode = 'perspective' | 'front' | 'side' | 'top';
