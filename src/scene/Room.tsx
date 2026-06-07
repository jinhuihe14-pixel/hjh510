import { useMemo } from 'react';
import { useStore } from '@/store/useStore';

export function Room() {
  const room = useStore((state) => state.room);

  const width = room.width / 1000;
  const depth = room.depth / 1000;
  const height = room.height / 1000;

  const floorGeometry: [number, number] = useMemo(() => [width, depth], [width, depth]);
  const wallGeometry: [number, number, number] = useMemo(() => [width, height, 0.05], [width, height]);
  const sideWallGeometry: [number, number, number] = useMemo(() => [depth, height, 0.05], [depth, height]);

  return (
    <group>
      {/* 地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={floorGeometry} />
        <meshStandardMaterial
          color={room.floorColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 后墙 */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={wallGeometry} />
        <meshStandardMaterial
          color={room.wallColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* 左墙 */}
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={sideWallGeometry} />
        <meshStandardMaterial
          color={room.wallColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* 右墙 */}
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={sideWallGeometry} />
        <meshStandardMaterial
          color={room.wallColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
