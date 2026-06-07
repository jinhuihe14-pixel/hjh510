import { useState, useCallback, useEffect } from 'react';
import { TopToolbar } from '@/components/TopToolbar';
import { ComponentPanel } from '@/components/ComponentPanel';
import { PropertyPanel } from '@/components/PropertyPanel';
import { CompareModal } from '@/components/CompareModal';
import { Scene } from '@/scene/Scene';
import { useStore } from '@/store/useStore';
import type { ViewMode } from '@/types';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const draggingComponent = useStore((state) => state.draggingComponent);
  const setDraggingComponent = useStore((state) => state.setDraggingComponent);
  const setHoverPosition = useStore((state) => state.setHoverPosition);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDraggingComponent(null);
      setHoverPosition(null);
    },
    [setDraggingComponent, setHoverPosition]
  );

  const handleDragLeave = useCallback(() => {
    // 不立即清除，留给场景内的处理
  }, []);

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggingComponent(null);
      setHoverPosition(null);
    };
    document.addEventListener('dragend', handleGlobalDragEnd);
    return () => document.removeEventListener('dragend', handleGlobalDragEnd);
  }, [setDraggingComponent, setHoverPosition]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      {/* 顶部工具栏 */}
      <TopToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* 主内容区 */}
      <div
        className="flex-1 flex overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {/* 左侧组件库 */}
        <ComponentPanel />

        {/* 中间3D场景 */}
        <div className="flex-1 relative">
          <Scene viewMode={viewMode} />

          {/* 操作提示 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-5 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <span>🖱️</span>
              <span>左键拖拽旋转</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>🔍</span>
              <span>滚轮缩放</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>📍</span>
              <span>右键平移</span>
            </span>
          </div>

          {/* 拖拽提示 */}
          {draggingComponent && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-sm px-6 py-2 rounded-full shadow-lg animate-pulse">
              将组件放置到合适位置
            </div>
          )}
        </div>

        {/* 右侧属性面板 */}
        <PropertyPanel />
      </div>

      {/* 方案对比弹窗 */}
      <CompareModal />
    </div>
  );
}
