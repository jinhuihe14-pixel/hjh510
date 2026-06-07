import { X, Check, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Scene } from '@/scene/Scene';

export function CompareModal() {
  const compareMode = useStore((state) => state.compareMode);
  const setCompareMode = useStore((state) => state.setCompareMode);
  const schemes = useStore((state) => state.schemes);
  const compareSchemes = useStore((state) => state.compareSchemes);
  const toggleCompareScheme = useStore((state) => state.toggleCompareScheme);

  if (!compareMode) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">方案对比</h2>
            <p className="text-sm text-gray-500">选择 2-4 个方案进行对比</p>
          </div>
          <button
            onClick={() => setCompareMode(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* 方案选择器 */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600">选择方案：</span>
            {schemes.map((scheme) => {
              const isSelected = compareSchemes.includes(scheme.id);
              return (
                <button
                  key={scheme.id}
                  onClick={() => toggleCompareScheme(scheme.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {isSelected ? <Check size={16} /> : <Plus size={16} />}
                  {scheme.name}
                </button>
              );
            })}
            {schemes.length === 0 && (
              <span className="text-sm text-gray-400">暂无保存的方案，请先保存方案</span>
            )}
          </div>
        </div>

        {/* 对比视图 */}
        <div className="flex-1 overflow-hidden p-6">
          {compareSchemes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={40} className="text-gray-300" />
                </div>
                <p>请从上方选择要对比的方案</p>
                <p className="text-sm text-gray-400 mt-1">最多可选择 4 个方案</p>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-4 h-full ${
                compareSchemes.length === 1
                  ? 'grid-cols-1'
                  : compareSchemes.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2'
              }`}
            >
              {compareSchemes.map((schemeId) => {
                const scheme = schemes.find((s) => s.id === schemeId);
                if (!scheme) return null;
                return (
                  <div
                    key={schemeId}
                    className="bg-gray-100 rounded-xl overflow-hidden flex flex-col relative group"
                  >
                    <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg shadow">
                      <p className="font-medium text-gray-800 text-sm">{scheme.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(scheme.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCompareScheme(schemeId)}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                    <div className="flex-1 min-h-0">
                      <CompareScene schemeId={schemeId} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setCompareMode(false)}
            className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareScene({ schemeId }: { schemeId: string }) {
  const schemes = useStore((state) => state.schemes);
  const scheme = schemes.find((s) => s.id === schemeId);

  if (!scheme) return null;

  return (
    <div className="w-full h-full">
      <Scene viewMode="perspective" />
    </div>
  );
}
