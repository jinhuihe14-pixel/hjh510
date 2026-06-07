import type { RoomConfig } from '@/types';

export const presetRooms: RoomConfig[] = [
  {
    id: 'master',
    name: '主卧',
    type: 'master',
    width: 4500,
    depth: 3600,
    height: 2800,
    wallColor: '#FAFAFA',
    floorColor: '#D7CCC8',
  },
  {
    id: 'second',
    name: '次卧',
    type: 'second',
    width: 3600,
    depth: 3000,
    height: 2800,
    wallColor: '#FAFAFA',
    floorColor: '#D7CCC8',
  },
  {
    id: 'walkin',
    name: '衣帽间',
    type: 'walkin',
    width: 3000,
    depth: 2400,
    height: 2800,
    wallColor: '#F5F5F5',
    floorColor: '#BCAAA4',
  },
];

export const defaultRoom: RoomConfig = presetRooms[0];
