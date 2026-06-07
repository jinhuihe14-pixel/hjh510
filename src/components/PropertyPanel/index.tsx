import { useState } from 'react';
import {
  Settings,
  Palette,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Trash2,
  RotateCw,
  Maximize2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { materials, doorStyles } from '@/data/materials';
import { allComponents } from '@/data/components';
import { formatPrice } from '@/utils/quote';
import type { LightingMode } from '@/types';

export function PropertyPanel() {
  const room = useStore((state) => state.room);
  const setRoom = useStore((state) => state.setRoom);
  const selectedComponentId = useStore((state) => state.selectedComponentId);
  const components = useStore((state) => state.components);
  const updateComponent = useStore((state) => state.updateComponent);
  const removeComponent = useStore((state) => state.removeComponent);
  const lightingMode = useStore((state) => state.lightingMode);
  const setLightingMode = useStore((state) => state.setLightingMode);
  const quote = useStore((state) => state.quote);

  const [expandedSections, setExpandedSections] = useState({
    room: true,
    material: true,
    lighting: true,
    quote: true,
  });

  const selectedComponent = components.find((c) => c.id === selectedComponentId);
  const selectedTemplate = selectedComponent
    ? allComponents.find((c) => c.id === selectedComponent.componentId)
    : null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRoomChange = (key: 'width' | 'depth' | 'height', value: number) => {
    setRoom({ ...room, [key]: value });
  };

  const handleMaterialChange = (materialId: string) => {
    if (selectedComponentId) {
      const material = materials.find((m) => m.id === materialId);
      updateComponent(selectedComponentId, {
        materialId,
        color: material?.color || '#8B7355',
      });
    }
  };

  const handleDoorStyleChange = (doorStyleId: string) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, { doorStyleId });
    }
  };

  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, {
        scale: {
          ...selectedComponent!.scale,
          [axis]: value,
        },
      });
    }
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, {
        position: {
          ...selectedComponent!.position,
          [axis]: value,
        },
      });
    }
  };

  const boardMaterials = materials.filter((m) => m.category === 'board');

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      {/* 标题 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">属性面板</h2>
        <p className="text-xs text-gray-500 mt-1">
          {selectedComponent ? `已选中: ${selectedTemplate?.name || '组件'}` : '点击选择组件'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 房间设置 */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('room')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Maximize2 size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">房间尺寸</span>
            </div>
            {expandedSections.room ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
          </button>
          {expandedSections.room && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">宽度 (mm)</label>
                <input
                  type="number"
                  value={room.width}
                  onChange={(e) => handleRoomChange('width', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  min={2000}
                  max={8000}
                  step={100}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">深度 (mm)</label>
                <input
                  type="number"
                  value={room.depth}
                  onChange={(e) => handleRoomChange('depth', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  min={2000}
                  max={8000}
                  step={100}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">高度 (mm)</label>
                <input
                  type="number"
                  value={room.height}
                  onChange={(e) => handleRoomChange('height', Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  min={2400}
                  max={3600}
                  step={100}
                />
              </div>
            </div>
          )}
        </div>

        {/* 材质设置 */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('material')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">材质选择</span>
            </div>
            {expandedSections.material ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
          </button>
          {expandedSections.material && (
            <div className="px-4 pb-4">
              {selectedComponent ? (
                <>
                  <p className="text-xs text-gray-500 mb-2">板材材质</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {boardMaterials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => handleMaterialChange(material.id)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          selectedComponent.materialId === material.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded mb-1"
                          style={{ backgroundColor: material.color }}
                        />
                        <p className="text-xs text-gray-600 truncate">{material.name}</p>
                      </button>
                    ))}
                  </div>

                  {selectedTemplate?.category === 'cabinet' && (
                    <>
                      <p className="text-xs text-gray-500 mb-2">柜门样式</p>
                      <div className="space-y-1">
                        {doorStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => handleDoorStyleChange(style.id)}
                            className={`w-full px-3 py-2 text-left text-sm rounded-lg border transition-all ${
                              selectedComponent.doorStyleId === style.id
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{style.name}</span>
                              <span className="text-xs text-gray-400">
                                {style.priceMultiplier > 1 ? `×${style.priceMultiplier}` : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{style.description}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">请先选择一个组件</p>
              )}
            </div>
          )}
        </div>

        {/* 选中组件属性 */}
        {selectedComponent && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('settings' as any)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-gray-600" />
                <span className="font-medium text-gray-700">组件属性</span>
              </div>
              <ChevronDown size={18} className="text-gray-400" />
            </button>
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">宽度比例</label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={selectedComponent.scale.x}
                  onChange={(e) => handleScaleChange('x', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 text-right">
                  {Math.round((selectedTemplate?.width || 0) * selectedComponent.scale.x)}mm
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">高度比例</label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={selectedComponent.scale.y}
                  onChange={(e) => handleScaleChange('y', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 text-right">
                  {Math.round((selectedTemplate?.height || 0) * selectedComponent.scale.y)}mm
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">深度比例</label>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={selectedComponent.scale.z}
                  onChange={(e) => handleScaleChange('z', Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 text-right">
                  {Math.round((selectedTemplate?.depth || 0) * selectedComponent.scale.z)}mm
                </p>
              </div>
              <button
                onClick={() => removeComponent(selectedComponentId)}
                className="w-full py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                删除组件
              </button>
            </div>
          </div>
        )}

        {/* 光照设置 */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('lighting')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sun size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">光照模式</span>
            </div>
            {expandedSections.lighting ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
          </button>
          {expandedSections.lighting && (
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setLightingMode('day')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    lightingMode === 'day'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Sun size={24} />
                  <span className="text-sm">白天</span>
                </button>
                <button
                  onClick={() => setLightingMode('evening')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    lightingMode === 'evening'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Moon size={24} />
                  <span className="text-sm">傍晚</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 报价面板 */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('quote')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gradient-to-r from-amber-50 to-orange-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">¥</span>
              </div>
              <div>
                <span className="font-bold text-lg text-amber-700">{formatPrice(quote.totalPrice)}</span>
                <p className="text-xs text-amber-600">实时报价</p>
              </div>
            </div>
            {expandedSections.quote ? (
              <ChevronDown size={18} className="text-amber-500" />
            ) : (
              <ChevronRight size={18} className="text-amber-500" />
            )}
          </button>
          {expandedSections.quote && (
            <div className="px-4 pb-4 space-y-2 bg-amber-50/50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">板材面积</span>
                <span className="text-gray-800">{quote.boardArea.toFixed(2)} ㎡</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">板材费用</span>
                <span className="text-gray-800">{formatPrice(quote.boardPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">柜门费用</span>
                <span className="text-gray-800">{formatPrice(quote.doorPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">隔板费用</span>
                <span className="text-gray-800">{formatPrice(quote.shelfPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">五金配件</span>
                <span className="text-gray-800">{formatPrice(quote.hardwareTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">安装人工</span>
                <span className="text-gray-800">{formatPrice(quote.laborPrice)}</span>
              </div>
              <div className="border-t border-amber-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">总价</span>
                  <span className="font-bold text-lg text-amber-600">{formatPrice(quote.totalPrice)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center pt-1">
                以上为参考报价，实际价格以门店为准
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
