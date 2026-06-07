import { useState } from 'react';
import {
  Box,
  DoorOpen,
  Wrench,
  Layers,
  Search,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getComponentsByCategory, allComponents } from '@/data/components';
import { getMaterialById } from '@/data/materials';
import type { ComponentCategory, CabinetComponent } from '@/types';

const categories: { id: ComponentCategory; name: string; icon: typeof Box }[] = [
  { id: 'cabinet', name: '柜体', icon: Box },
  { id: 'door', name: '柜门', icon: DoorOpen },
  { id: 'hardware', name: '五金', icon: Wrench },
  { id: 'shelf', name: '隔板', icon: Layers },
];

export function ComponentPanel() {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('cabinet');
  const [searchQuery, setSearchQuery] = useState('');
  const setDraggingComponent = useStore((state) => state.setDraggingComponent);

  const components = getComponentsByCategory(activeCategory).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, component: CabinetComponent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', component.id);
    setDraggingComponent(component);
  };

  const handleDragEnd = () => {
    setDraggingComponent(null);
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* 标题 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">组件库</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽组件到场景中</p>
      </div>

      {/* 分类标签 */}
      <div className="flex border-b border-gray-100">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
                activeCategory === cat.id
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 搜索框 */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="搜索组件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* 组件列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {components.map((component) => {
            const material = getMaterialById(component.defaultMaterial);
            return (
              <div
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component)}
                onDragEnd={handleDragEnd}
                className="bg-gray-50 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-amber-50 hover:shadow-md transition-all group border border-gray-100 hover:border-amber-300"
              >
                {/* 预览图 */}
                <div
                  className="h-20 rounded-md mb-2 flex items-center justify-center"
                  style={{ backgroundColor: material?.color || '#E0E0E0' }}
                >
                  <Box size={32} className="text-white/80" />
                </div>
                {/* 名称 */}
                <p className="text-xs font-medium text-gray-700 truncate group-hover:text-amber-700">
                  {component.name}
                </p>
                {/* 尺寸 */}
                <p className="text-xs text-gray-400 mt-0.5">
                  {component.width}×{component.height}mm
                </p>
                {/* 价格 */}
                <p className="text-xs text-amber-600 font-medium mt-1">
                  ¥{component.price}
                </p>
              </div>
            );
          })}
        </div>

        {components.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无匹配的组件
          </div>
        )}
      </div>
    </div>
  );
}
