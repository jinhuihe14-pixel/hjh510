import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { Room } from './Room';
import { Cabinet } from './Cabinet';
import { Lights } from './Lights';
import type { ViewMode } from '@/types';

interface SceneContentProps {
  viewMode: ViewMode;
}

function SceneContent({ viewMode }: SceneContentProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const room = useStore((state) => state.room);
  const components = useStore((state) => state.components);
  const selectedComponentId = useStore((state) => state.selectedComponentId);
  const selectComponent = useStore((state) => state.selectComponent);
  const draggingComponent = useStore((state) => state.draggingComponent);
  const hoverPosition = useStore((state) => state.hoverPosition);
  const addComponent = useStore((state) => state.addComponent);
  const setHoverPosition = useStore((state) => state.setHoverPosition);
  const setDraggingComponent = useStore((state) => state.setDraggingComponent);
  const lightingMode = useStore((state) => state.lightingMode);

  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const floorPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const isDragging = useRef(false);

  const width = room.width / 1000;
  const depth = room.depth / 1000;

  useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minPolarAngle = 0.2;
    controls.target.set(0, 1, 0);

    switch (viewMode) {
      case 'front':
        camera.position.set(0, 1.5, 6);
        controls.target.set(0, 1.4, 0);
        break;
      case 'side':
        camera.position.set(6, 1.5, 0);
        controls.target.set(0, 1.4, 0);
        break;
      case 'top':
        camera.position.set(0, 8, 0.01);
        controls.target.set(0, 0, 0);
        break;
      default:
        camera.position.set(5, 3.5, 4.5);
        controls.target.set(0, 1.2, -1);
        break;
    }
  }, [viewMode, camera]);

  const updateMousePosition = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl]);

  const getFloorIntersection = useCallback(() => {
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersectPoint = new THREE.Vector3();
    raycasterRef.current.ray.intersectPlane(floorPlaneRef.current, intersectPoint);
    return intersectPoint;
  }, [camera]);

  const handlePointerMove = useCallback((event: any) => {
    if (!draggingComponent) return;

    updateMousePosition(event.clientX, event.clientY);
    const point = getFloorIntersection();

    if (point) {
      const snapX = Math.round(point.x * 10) / 10;
      const snapZ = Math.round(point.z * 10) / 10;

      const halfWidth = (draggingComponent.width / 1000) / 2;
      const halfDepth = (draggingComponent.depth / 1000) / 2;

      const clampedX = Math.max(-width / 2 + halfWidth, Math.min(width / 2 - halfWidth, snapX));
      const clampedZ = Math.max(-depth / 2 + halfDepth, Math.min(depth / 2 - halfDepth, snapZ));

      setHoverPosition({ x: clampedX, z: clampedZ });
    }
  }, [draggingComponent, updateMousePosition, getFloorIntersection, width, depth, setHoverPosition]);

  const handlePointerDown = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePointerUp = useCallback((event: any) => {
    if (draggingComponent && hoverPosition) {
      addComponent(draggingComponent, {
        x: hoverPosition.x,
        y: 0,
        z: hoverPosition.z,
      });
      event.stopPropagation();
    }
  }, [draggingComponent, hoverPosition, addComponent]);

  const handleCanvasDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (hoverPosition && draggingComponent) {
      addComponent(draggingComponent, {
        x: hoverPosition.x,
        y: 0,
        z: hoverPosition.z,
      });
    }
    setDraggingComponent(null);
    setHoverPosition(null);
  }, [hoverPosition, draggingComponent, addComponent, setDraggingComponent, setHoverPosition]);

  const handleCanvasDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.clientX && event.clientY) {
      updateMousePosition(event.clientX, event.clientY);
      const point = getFloorIntersection();
      if (point && draggingComponent) {
        const snapX = Math.round(point.x * 10) / 10;
        const snapZ = Math.round(point.z * 10) / 10;
        const halfWidth = (draggingComponent.width / 1000) / 2;
        const halfDepth = (draggingComponent.depth / 1000) / 2;
        const clampedX = Math.max(-width / 2 + halfWidth, Math.min(width / 2 - halfWidth, snapX));
        const clampedZ = Math.max(-depth / 2 + halfDepth, Math.min(depth / 2 - halfDepth, snapZ));
        setHoverPosition({ x: clampedX, z: clampedZ });
      }
    }
  }, [updateMousePosition, getFloorIntersection, draggingComponent, width, depth, setHoverPosition]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('drop', handleCanvasDrop);
    return () => {
      canvas.removeEventListener('dragover', handleCanvasDragOver);
      canvas.removeEventListener('drop', handleCanvasDrop);
    };
  }, [gl, handleCanvasDragOver, handleCanvasDrop]);

  const compWidth = draggingComponent ? (draggingComponent.width / 1000) : 0;
  const compHeight = draggingComponent ? (draggingComponent.height / 1000) : 0;
  const compDepth = draggingComponent ? (draggingComponent.depth / 1000) : 0;

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={[5, 3.5, 4.5]} />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />

      <Lights mode={lightingMode} />

      <Room />

      {/* 网格辅助 */}
      <Grid
        position={[0, 0.002, 0]}
        args={[Math.max(width, depth) * 2, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#E0E0E0"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#BDBDBD"
        fadeDistance={20}
        fadeStrength={0.5}
        followCamera={false}
      />

      {/* 不可见的接收平面，用于拖拽和点击 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          e.stopPropagation();
          selectComponent(null);
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 已放置的组件 */}
      {components.map((comp) => (
        <Cabinet
          key={comp.id}
          component={comp}
          isSelected={comp.id === selectedComponentId}
          onClick={() => selectComponent(comp.id)}
        />
      ))}

      {/* 拖拽预览 */}
      {draggingComponent && hoverPosition && (
        <mesh position={[hoverPosition.x, compHeight / 2, hoverPosition.z]}>
          <boxGeometry args={[compWidth, compHeight, compDepth]} />
          <meshStandardMaterial
            color="#FFB74D"
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* 背景色 */}
      <color attach="background" args={[lightingMode === 'day' ? '#F8F5F0' : '#2D1F1A']} />

      {/* 雾效 */}
      <fog attach="fog" args={[lightingMode === 'day' ? '#F8F5F0' : '#2D1F1A', 10, 25]} />
    </>
  );
}

interface SceneProps {
  viewMode: ViewMode;
}

export function Scene({ viewMode }: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent viewMode={viewMode} />
    </Canvas>
  );
}
