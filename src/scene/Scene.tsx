import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { Room } from './Room';
import { Cabinet } from './Cabinet';
import { Lights } from './Lights';
import { allComponents } from '@/data/components';
import type { ViewMode, PlacedComponent } from '@/types';

const SNAP_THRESHOLD = 0.1;
const GRID_SIZE = 0.1;

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
  const draggingPlacedId = useStore((state) => state.draggingPlacedId);
  const setDraggingPlacedId = useStore((state) => state.setDraggingPlacedId);
  const updateComponent = useStore((state) => state.updateComponent);
  const saveState = useStore((state) => state.saveState);

  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const floorPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const isDragging = useRef(false);
  const dragOffsetRef = useRef({ x: 0, z: 0 });
  const dragStartPosRef = useRef({ x: 0, z: 0 });
  const hasMovedRef = useRef(false);
  const dragStateSavedRef = useRef(false);

  const width = room.width / 1000;
  const depth = room.depth / 1000;

  const getComponentSize = useCallback((comp: PlacedComponent) => {
    const template = allComponents.find((c) => c.id === comp.componentId);
    if (!template) return { width: 0.6, depth: 0.6, height: 2.4 };
    return {
      width: (template.width * comp.scale.x) / 1000,
      depth: (template.depth * comp.scale.z) / 1000,
      height: (template.height * comp.scale.y) / 1000,
    };
  }, []);

  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  const snapToWalls = useCallback((x: number, z: number, compWidth: number, compDepth: number) => {
    let snappedX = x;
    let snappedZ = z;

    const halfWidth = compWidth / 2;
    const halfDepth = compDepth / 2;

    const leftWall = -width / 2;
    const rightWall = width / 2;
    const backWall = -depth / 2;
    const frontWall = depth / 2;

    if (Math.abs((x - halfWidth) - leftWall) < SNAP_THRESHOLD) {
      snappedX = leftWall + halfWidth;
    }
    if (Math.abs((x + halfWidth) - rightWall) < SNAP_THRESHOLD) {
      snappedX = rightWall - halfWidth;
    }
    if (Math.abs((z - halfDepth) - backWall) < SNAP_THRESHOLD) {
      snappedZ = backWall + halfDepth;
    }
    if (Math.abs((z + halfDepth) - frontWall) < SNAP_THRESHOLD) {
      snappedZ = frontWall - halfDepth;
    }

    return { x: snappedX, z: snappedZ };
  }, [width, depth]);

  const snapToOtherCabinets = useCallback((
    x: number,
    z: number,
    compWidth: number,
    compDepth: number,
    excludeId: string
  ) => {
    let snappedX = x;
    let snappedZ = z;

    const halfWidth = compWidth / 2;
    const halfDepth = compDepth / 2;

    const thisLeft = x - halfWidth;
    const thisRight = x + halfWidth;
    const thisBack = z - halfDepth;
    const thisFront = z + halfDepth;

    for (const other of components) {
      if (other.id === excludeId) continue;

      const otherSize = getComponentSize(other);
      const otherHalfWidth = otherSize.width / 2;
      const otherHalfDepth = otherSize.depth / 2;

      const otherLeft = other.position.x - otherHalfWidth;
      const otherRight = other.position.x + otherHalfWidth;
      const otherBack = other.position.z - otherHalfDepth;
      const otherFront = other.position.z + otherHalfDepth;

      const zOverlap = thisFront > otherBack && thisBack < otherFront;
      const xOverlap = thisRight > otherLeft && thisLeft < otherRight;

      if (zOverlap) {
        if (Math.abs(thisLeft - otherRight) < SNAP_THRESHOLD) {
          snappedX = otherRight + halfWidth;
        }
        if (Math.abs(thisRight - otherLeft) < SNAP_THRESHOLD) {
          snappedX = otherLeft - halfWidth;
        }
        if (Math.abs(x - other.position.x) < SNAP_THRESHOLD && Math.abs(compWidth - otherSize.width) < 0.01) {
          snappedX = other.position.x;
        }
      }

      if (xOverlap) {
        if (Math.abs(thisBack - otherFront) < SNAP_THRESHOLD) {
          snappedZ = otherFront + halfDepth;
        }
        if (Math.abs(thisFront - otherBack) < SNAP_THRESHOLD) {
          snappedZ = otherBack - halfDepth;
        }
        if (Math.abs(z - other.position.z) < SNAP_THRESHOLD && Math.abs(compDepth - otherSize.depth) < 0.01) {
          snappedZ = other.position.z;
        }
      }
    }

    return { x: snappedX, z: snappedZ };
  }, [components, getComponentSize]);

  const clampToBounds = useCallback((x: number, z: number, compWidth: number, compDepth: number) => {
    const halfWidth = compWidth / 2;
    const halfDepth = compDepth / 2;

    const clampedX = Math.max(
      -width / 2 + halfWidth,
      Math.min(width / 2 - halfWidth, x)
    );
    const clampedZ = Math.max(
      -depth / 2 + halfDepth,
      Math.min(depth / 2 - halfDepth, z)
    );

    return { x: clampedX, z: clampedZ };
  }, [width, depth]);

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
  }, [
    draggingComponent,
    updateMousePosition,
    getFloorIntersection,
    width,
    depth,
    setHoverPosition,
  ]);

  const handlePointerDown = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePointerUp = useCallback((event: any) => {
    if (draggingPlacedId) {
      setDraggingPlacedId(null);
      event.stopPropagation();
      return;
    }

    if (draggingComponent && hoverPosition) {
      addComponent(draggingComponent, {
        x: hoverPosition.x,
        y: 0,
        z: hoverPosition.z,
      });
      event.stopPropagation();
    }
  }, [
    draggingPlacedId,
    draggingComponent,
    hoverPosition,
    addComponent,
    setDraggingPlacedId,
  ]);

  const handleCabinetPointerDown = useCallback((compId: string, event: any) => {
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;

    event.stopPropagation();
    selectComponent(compId);

    updateMousePosition(event.clientX, event.clientY);
    const point = getFloorIntersection();
    if (point) {
      dragOffsetRef.current = {
        x: comp.position.x - point.x,
        z: comp.position.z - point.z,
      };
      dragStartPosRef.current = {
        x: comp.position.x,
        z: comp.position.z,
      };
      hasMovedRef.current = false;
      dragStateSavedRef.current = false;
      setDraggingPlacedId(compId);
      gl.domElement.style.cursor = 'grabbing';
    }
  }, [components, updateMousePosition, getFloorIntersection, selectComponent, setDraggingPlacedId, gl]);

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

  const handleGlobalPointerMove = useCallback((event: PointerEvent) => {
    if (!draggingPlacedId) return;

    updateMousePosition(event.clientX, event.clientY);
    const point = getFloorIntersection();

    if (point) {
      const comp = components.find((c) => c.id === draggingPlacedId);
      if (!comp) return;

      const size = getComponentSize(comp);

      let targetX = point.x + dragOffsetRef.current.x;
      let targetZ = point.z + dragOffsetRef.current.z;

      targetX = snapToGrid(targetX);
      targetZ = snapToGrid(targetZ);

      const wallSnapped = snapToWalls(targetX, targetZ, size.width, size.depth);
      targetX = wallSnapped.x;
      targetZ = wallSnapped.z;

      const cabinetSnapped = snapToOtherCabinets(
        targetX,
        targetZ,
        size.width,
        size.depth,
        draggingPlacedId
      );
      targetX = cabinetSnapped.x;
      targetZ = cabinetSnapped.z;

      const clamped = clampToBounds(targetX, targetZ, size.width, size.depth);
      targetX = clamped.x;
      targetZ = clamped.z;

      const dx = Math.abs(targetX - dragStartPosRef.current.x);
      const dz = Math.abs(targetZ - dragStartPosRef.current.z);
      if (dx > 0.001 || dz > 0.001) {
        if (!hasMovedRef.current && !dragStateSavedRef.current) {
          saveState();
          dragStateSavedRef.current = true;
        }
        hasMovedRef.current = true;
      }

      updateComponent(draggingPlacedId, {
        position: { x: targetX, y: 0, z: targetZ },
      });
    }
  }, [
    draggingPlacedId,
    components,
    updateMousePosition,
    getFloorIntersection,
    getComponentSize,
    snapToGrid,
    snapToWalls,
    snapToOtherCabinets,
    clampToBounds,
    updateComponent,
    saveState,
  ]);

  const handleGlobalPointerUp = useCallback(() => {
    if (draggingPlacedId) {
      setDraggingPlacedId(null);
      gl.domElement.style.cursor = 'default';
    }
  }, [draggingPlacedId, setDraggingPlacedId, gl]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('dragover', handleCanvasDragOver);
    canvas.addEventListener('drop', handleCanvasDrop);
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      canvas.removeEventListener('dragover', handleCanvasDragOver);
      canvas.removeEventListener('drop', handleCanvasDrop);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [gl, handleCanvasDragOver, handleCanvasDrop, handleGlobalPointerMove, handleGlobalPointerUp]);

  const compWidth = draggingComponent ? (draggingComponent.width / 1000) : 0;
  const compHeight = draggingComponent ? (draggingComponent.height / 1000) : 0;
  const compDepth = draggingComponent ? (draggingComponent.depth / 1000) : 0;

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={[5, 3.5, 4.5]} />
      <OrbitControls
        ref={controlsRef}
        enablePan={!draggingPlacedId}
        enableZoom={true}
        enableRotate={!draggingPlacedId}
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
          onPointerDown={(e) => handleCabinetPointerDown(comp.id, e)}
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
