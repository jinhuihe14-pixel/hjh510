import { useMemo } from 'react';
import type { PlacedComponent } from '@/types';
import { allComponents } from '@/data/components';
import { getMaterialById } from '@/data/materials';

interface CabinetProps {
  component: PlacedComponent;
  isSelected: boolean;
  onClick: () => void;
  onPointerDown?: (event: any) => void;
  onResizeStart?: (handle: 'left' | 'right' | 'top', event: any) => void;
}

export function Cabinet({ component, isSelected, onClick, onPointerDown, onResizeStart }: CabinetProps) {
  const template = allComponents.find((c) => c.id === component.componentId);
  const material = getMaterialById(component.materialId);

  const width = (template?.width || 600) * component.scale.x / 1000;
  const height = (template?.height || 2400) * component.scale.y / 1000;
  const depth = (template?.depth || 600) * component.scale.z / 1000;

  const boardThickness = 0.018;
  const innerWidth = width - boardThickness * 2;
  const innerDepth = depth - boardThickness;

  const boardMaterial = useMemo(() => ({
    color: material?.color || '#8B7355',
    roughness: material?.roughness ?? 0.6,
    metalness: material?.metalness ?? 0.05,
    emissive: material?.color || '#8B7355',
    emissiveIntensity: 0.08,
  }), [material]);

  const shelfCount = Math.max(0, Math.floor(height / 0.4) - 1);
  const shelfSpacing = height / (shelfCount + 1);

  const isCorner = template?.type === 'corner';

  if (isCorner) {
    return (
      <group
        position={[component.position.x, height / 2, component.position.z]}
        rotation={[component.rotation.x, component.rotation.y, component.rotation.z]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPointerDown?.(e);
        }}
      >
        <mesh position={[-width / 4, 0, -depth / 4]} castShadow receiveShadow>
          <boxGeometry args={[width / 2, height, depth / 2]} />
          <meshStandardMaterial {...boardMaterial} />
        </mesh>
        <mesh position={[0, 0, -depth * 0.35]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.3, height, depth * 0.3]} />
          <meshStandardMaterial {...boardMaterial} />
        </mesh>
        <mesh position={[-width * 0.35, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 0.3, height, depth * 0.3]} />
          <meshStandardMaterial {...boardMaterial} />
        </mesh>
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width * 0.7, height + 0.02, depth * 0.7]} />
            <meshBasicMaterial color="#FFB74D" transparent opacity={0.2} wireframe />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group
      position={[component.position.x, height / 2, component.position.z]}
      rotation={[component.rotation.x, component.rotation.y, component.rotation.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown?.(e);
      }}
    >
      {/* 左侧板 */}
      <mesh position={[-width / 2 + boardThickness / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, height, depth]} />
        <meshStandardMaterial {...boardMaterial} />
      </mesh>

      {/* 右侧板 */}
      <mesh position={[width / 2 - boardThickness / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, height, depth]} />
        <meshStandardMaterial {...boardMaterial} />
      </mesh>

      {/* 顶板 */}
      <mesh position={[0, height / 2 - boardThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, boardThickness, depth]} />
        <meshStandardMaterial {...boardMaterial} />
      </mesh>

      {/* 底板 */}
      <mesh position={[0, -height / 2 + boardThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, boardThickness, depth]} />
        <meshStandardMaterial {...boardMaterial} />
      </mesh>

      {/* 背板 */}
      <mesh position={[0, 0, -depth / 2 + 0.005]} castShadow receiveShadow>
        <boxGeometry args={[innerWidth, height - boardThickness * 2, 0.01]} />
        <meshStandardMaterial {...boardMaterial} />
      </mesh>

      {/* 层板 */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh
          key={i}
          position={[0, -height / 2 + shelfSpacing * (i + 1), 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[innerWidth, boardThickness, innerDepth]} />
          <meshStandardMaterial {...boardMaterial} />
        </mesh>
      ))}

      {/* 挂衣杆 */}
      {shelfCount >= 1 && (
        <mesh
          position={[0, -height / 2 + shelfSpacing * 1.5 - 0.05, -depth / 4]}
          rotation={[0, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.012, 0.012, innerWidth * 0.9, 12]} />
          <meshStandardMaterial color="#B0BEC5" roughness={0.3} metalness={0.8} />
        </mesh>
      )}

      {/* 柜门 - 平板门 */}
      {component.doorStyleId && component.doorStyleId !== 'sliding' && (
        <>
          <mesh position={[-width / 4, 0, depth / 2 + 0.01]} castShadow receiveShadow>
            <boxGeometry args={[width / 2 - 0.005, height - 0.01, 0.02]} />
            <meshStandardMaterial {...boardMaterial} />
          </mesh>
          <mesh position={[width / 4, 0, depth / 2 + 0.01]} castShadow receiveShadow>
            <boxGeometry args={[width / 2 - 0.005, height - 0.01, 0.02]} />
            <meshStandardMaterial {...boardMaterial} />
          </mesh>
          {/* 拉手 */}
          <mesh position={[-width / 4 + 0.1, 0, depth / 2 + 0.025]} castShadow>
            <boxGeometry args={[0.012, 0.15, 0.015]} />
            <meshStandardMaterial color="#78909C" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[width / 4 - 0.1, 0, depth / 2 + 0.025]} castShadow>
            <boxGeometry args={[0.012, 0.15, 0.015]} />
            <meshStandardMaterial color="#78909C" roughness={0.3} metalness={0.8} />
          </mesh>
        </>
      )}

      {/* 选中高亮 */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width + 0.02, height + 0.02, depth + 0.02]} />
          <meshBasicMaterial color="#FFB74D" transparent opacity={0.3} />
        </mesh>
      )}

      {/* 缩放手柄 */}
      {isSelected && onResizeStart && (
        <>
          {/* 右侧手柄 - 调整宽度 */}
          <mesh
            position={[width / 2 + 0.02, 0, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeStart('right', e);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'ew-resize';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[0.04, height * 0.3, depth * 0.6]} />
            <meshStandardMaterial color="#FFB74D" emissive="#FFB74D" emissiveIntensity={0.5} />
          </mesh>

          {/* 左侧手柄 - 调整宽度 */}
          <mesh
            position={[-width / 2 - 0.02, 0, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeStart('left', e);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'ew-resize';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[0.04, height * 0.3, depth * 0.6]} />
            <meshStandardMaterial color="#FFB74D" emissive="#FFB74D" emissiveIntensity={0.5} />
          </mesh>

          {/* 顶部手柄 - 调整高度 */}
          <mesh
            position={[0, height / 2 + 0.02, 0]}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeStart('top', e);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'ns-resize';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[width * 0.3, 0.04, depth * 0.6]} />
            <meshStandardMaterial color="#FFB74D" emissive="#FFB74D" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}
