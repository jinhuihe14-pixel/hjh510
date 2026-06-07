import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import type { LightingMode } from '@/types';

interface LightsProps {
  mode: LightingMode;
}

export function Lights({ mode }: LightsProps) {
  const isDay = mode === 'day';

  const dayConfig = useMemo(
    () => ({
      ambient: { intensity: 0.85, color: '#FFF8E7' },
      directional: { intensity: 1.0, color: '#FFFAF0', position: [3, 5, 2] as [number, number, number] },
      fill: { intensity: 0.5, color: '#E3F2FD', position: [-3, 2, -2] as [number, number, number] },
      point1: { intensity: 0, color: '#000000', position: [0, 0, 0] as [number, number, number] },
      point2: { intensity: 0, color: '#000000', position: [0, 0, 0] as [number, number, number] },
    }),
    []
  );

  const eveningConfig = useMemo(
    () => ({
      ambient: { intensity: 0.4, color: '#5D4037' },
      directional: { intensity: 0.4, color: '#FF8F00', position: [2, 4, 1] as [number, number, number] },
      fill: { intensity: 0.2, color: '#6D4C41', position: [-2, 2, -1] as [number, number, number] },
      point1: { intensity: 1.0, color: '#FFB74D', position: [0, 2.5, -1.5] as [number, number, number] },
      point2: { intensity: 0.6, color: '#FFCC80', position: [-1.5, 2, -1] as [number, number, number] },
    }),
    []
  );

  const config = isDay ? dayConfig : eveningConfig;

  return (
    <>
      <ambientLight intensity={config.ambient.intensity} color={config.ambient.color} />

      <directionalLight
        castShadow
        intensity={config.directional.intensity}
        color={config.directional.color}
        position={config.directional.position}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />

      <directionalLight
        intensity={config.fill.intensity}
        color={config.fill.color}
        position={config.fill.position}
      />

      {!isDay && (
        <>
          <pointLight
            intensity={config.point1.intensity}
            color={config.point1.color}
            position={config.point1.position}
            distance={5}
            decay={2}
          />
          <pointLight
            intensity={config.point2.intensity}
            color={config.point2.color}
            position={config.point2.position}
            distance={4}
            decay={2}
          />
        </>
      )}
    </>
  );
}
