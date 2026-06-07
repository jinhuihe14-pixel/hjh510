import { useState } from 'react';
import {
  Home,
  Save,
  FolderOpen,
  Download,
  Undo2,
  Redo2,
  SplitSquareHorizontal,
  Menu,
  X,
  Trash2,
  Eye,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { presetRooms } from '@/data/rooms';
import type { ViewMode } from '@/types';

interface TopToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function TopToolbar({ viewMode, onViewModeChange }: TopToolbarProps) {
  const room = useStore((state) => state.room);
  const setRoom = useStore((state) => state.setRoom);
  const saveScheme = useStore((state) => state.saveScheme);
  const schemes = useStore((state) => state.schemes);
  const loadScheme = useStore((state) => state.loadScheme);
  const deleteScheme = useStore((state) => state.deleteScheme);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const setCompareMode = useStore((state) => state.setCompareMode);
  const compareMode = useStore((state) => state.compareMode);

  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showSchemeMenu, setShowSchemeMenu] = useState(false);
  const [schemeName, setSchemeName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleRoomChange = (roomId: string) => {
    const newRoom = presetRooms.find((r) => r.id === roomId);
    if (newRoom) {
      setRoom({ ...newRoom });
      setShowRoomMenu(false);
    }
  };

  const handleSaveScheme = () => {
    if (schemeName.trim()) {
      saveScheme(schemeName.trim());
      setSchemeName('');
      setShowSaveDialog(false);
    }
  };

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `衣柜方案_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const viewModes: { id: ViewMode; name: string }[] = [
    { id: 'perspective', name: '透视' },
    { id: 'front', name: '正视' },
    { id: 'side', name: '侧视' },
    { id: 'top', name: '俯视' },
  ];

  return (
    <div className="h-16 bg-gradient-to-r from-stone-800 to-stone-700 text-white flex items-center justify-between px-6 shadow-lg">
      {/* 左侧Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
          <Home size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">衣柜3D设计工具</h1>
          <p className="text-xs text-stone-400">全屋定制可视化预览</p>
        </div>
      </div>

      {/* 中间工具按钮 */}
      <div className="flex items-center gap-1">
        {/* 户型切换 */}
        <div className="relative">
          <button
            onClick={() => setShowRoomMenu(!showRoomMenu)}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
          >
            <Home size={18} />
            <span>{room.name}</span>
            <Menu size={14} />
          </button>
          {showRoomMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-40 z-50">
              {presetRooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoomChange(r.id)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-amber-50 transition-colors ${
                    room.id === r.id ? 'text-amber-600 bg-amber-50' : 'text-gray-700'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-white/20 mx-2" />

        {/* 撤销重做 */}
        <button
          onClick={undo}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="撤销"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={redo}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="重做"
        >
          <Redo2 size={20} />
        </button>

        <div className="w-px h-6 bg-white/20 mx-2" />

        {/* 视角切换 */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onViewModeChange(mode.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === mode.id
                  ? 'bg-amber-500 text-white'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/20 mx-2" />

        {/* 方案对比 */}
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
            compareMode ? 'bg-amber-500 text-white' : 'hover:bg-white/10'
          }`}
        >
          <SplitSquareHorizontal size={18} />
          <span>方案对比</span>
        </button>
      </div>

      {/* 右侧操作按钮 */}
      <div className="flex items-center gap-2">
        {/* 保存方案 */}
        <div className="relative">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Save size={18} />
            <span>保存方案</span>
          </button>
        </div>

        {/* 方案列表 */}
        <div className="relative">
          <button
            onClick={() => setShowSchemeMenu(!showSchemeMenu)}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
          >
            <FolderOpen size={18} />
            <span>我的方案</span>
            {schemes.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {schemes.length}
              </span>
            )}
          </button>
          {showSchemeMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-56 z-50 max-h-80 overflow-y-auto">
              {schemes.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">暂无保存的方案</p>
              ) : (
                schemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {scheme.name}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            loadScheme(scheme.id);
                            setShowSchemeMenu(false);
                          }}
                          className="p-1 text-gray-500 hover:text-amber-600"
                          title="加载"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => deleteScheme(scheme.id)}
                          className="p-1 text-gray-500 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(scheme.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 导出图片 */}
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Download size={18} />
          <span>导出图片</span>
        </button>
      </div>

      {/* 保存方案对话框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">保存方案</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              placeholder="请输入方案名称"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveScheme()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveScheme}
                disabled={!schemeName.trim()}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
