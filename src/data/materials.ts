import type { Material, DoorStyle } from '@/types';

export const materials: Material[] = [
  {
    id: 'white-melamine',
    name: '白色双饰面',
    category: 'board',
    color: '#FAFAFA',
    roughness: 0.7,
    metalness: 0.05,
    pricePerSqm: 180,
  },
  {
    id: 'walnut-light',
    name: '浅胡桃木',
    category: 'board',
    color: '#A1887F',
    roughness: 0.6,
    metalness: 0.05,
    pricePerSqm: 260,
  },
  {
    id: 'walnut-dark',
    name: '深胡桃木',
    category: 'board',
    color: '#6D4C41',
    roughness: 0.65,
    metalness: 0.05,
    pricePerSqm: 280,
  },
  {
    id: 'oak',
    name: '橡木纹',
    category: 'board',
    color: '#D7CCC8',
    roughness: 0.6,
    metalness: 0.05,
    pricePerSqm: 240,
  },
  {
    id: 'cement-gray',
    name: '灰色水泥纹',
    category: 'board',
    color: '#9E9E9E',
    roughness: 0.8,
    metalness: 0.05,
    pricePerSqm: 220,
  },
  {
    id: 'white-pvc',
    name: '暖白色吸塑',
    category: 'board',
    color: '#FFF8E1',
    roughness: 0.5,
    metalness: 0.02,
    pricePerSqm: 320,
  },
  {
    id: 'glass-clear',
    name: '透明玻璃',
    category: 'door',
    color: '#E3F2FD',
    roughness: 0.05,
    metalness: 0.1,
    pricePerSqm: 450,
  },
  {
    id: 'glass-frosted',
    name: '磨砂玻璃',
    category: 'door',
    color: '#ECEFF1',
    roughness: 0.4,
    metalness: 0.05,
    pricePerSqm: 380,
  },
  {
    id: 'metal-chrome',
    name: '镀铬金属',
    category: 'hardware',
    color: '#ECEFF1',
    roughness: 0.2,
    metalness: 0.9,
    pricePerSqm: 0,
  },
  {
    id: 'metal-gold',
    name: '金色金属',
    category: 'hardware',
    color: '#FFD54F',
    roughness: 0.25,
    metalness: 0.85,
    pricePerSqm: 0,
  },
  {
    id: 'metal-black',
    name: '哑黑金属',
    category: 'hardware',
    color: '#37474F',
    roughness: 0.4,
    metalness: 0.6,
    pricePerSqm: 0,
  },
];

export const doorStyles: DoorStyle[] = [
  {
    id: 'flat',
    name: '平板门',
    type: 'flat',
    description: '简约现代平板设计',
    priceMultiplier: 1.0,
  },
  {
    id: 'molded',
    name: '模压门',
    type: 'molded',
    description: '欧式造型线条',
    priceMultiplier: 1.3,
  },
  {
    id: 'louvered',
    name: '百叶门',
    type: 'louvered',
    description: '透气百叶设计',
    priceMultiplier: 1.5,
  },
  {
    id: 'glass',
    name: '玻璃门',
    type: 'glass',
    description: '透明/磨砂玻璃',
    priceMultiplier: 1.8,
  },
  {
    id: 'sliding',
    name: '推拉门',
    type: 'sliding',
    description: '节省空间设计',
    priceMultiplier: 2.0,
  },
];

export const getMaterialById = (id: string): Material | undefined => {
  return materials.find((m) => m.id === id);
};

export const getDoorStyleById = (id: string): DoorStyle | undefined => {
  return doorStyles.find((d) => d.id === id);
};
