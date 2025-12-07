
import React, { useState } from 'react';
import { GeneratedImage } from '../types';

interface ResultCardProps {
  title: string;
  description: string;
  data: GeneratedImage;
  onRegenerate: () => void;
  onPromptChange?: (prompt: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, description, data, onRegenerate, onPromptChange }) => {
  const { status, imageUrl, error, currentPrompt } = data;
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `studio-portrait-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRegenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Close editor if open when directly clicking refresh
    setShowPromptEditor(false); 
    onRegenerate();
  };

  const handleCustomRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegenerate();
    // Optional: Keep editor open or close it. Keeping it open might be better for iteration.
  };

  return (
    <div className="bg-studio-800 rounded-xl overflow-hidden border border-studio-700 shadow-xl flex flex-col h-full group transition-all duration-300 hover:border-studio-500 hover:shadow-2xl hover:shadow-purple-900/20">
      
      {/* Image Area */}
      <div className="relative aspect-[3/4] bg-studio-900 w-full overflow-hidden">
        {status === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-studio-900/80 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-indigo-300 font-medium tracking-wider animate-pulse">生成中</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-red-900/10 z-10">
            <svg className="w-10 h-10 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-200 font-medium">生成失败</p>
            <p className="text-xs text-red-300 mt-1 mb-3 max-w-[90%] opacity-80">{error || "请重试"}</p>
            <button 
              onClick={handleRegenerateClick}
              className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs rounded-full border border-red-500/30 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重试
            </button>
          </div>
        )}

        {status === 'success' && imageUrl && (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        
        {/* Overlay Actions */}
        {status === 'success' && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row items-center justify-center gap-2 p-4 z-20">
             <button 
              onClick={handleRegenerateClick}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full border border-white/20 flex items-center gap-2 transition-all transform hover:scale-105 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重绘
            </button>
            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-indigo-500/80 hover:bg-indigo-500 backdrop-blur-md text-white rounded-full border border-indigo-400/30 flex items-center gap-2 transition-all transform hover:scale-105 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              保存
            </button>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 border-t border-studio-700 bg-studio-800 relative z-20 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-white font-semibold text-lg truncate flex-1" title={title}>{title}</h4>
          <button 
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ${showPromptEditor ? 'bg-studio-600 text-white border-studio-500' : 'text-slate-400 border-studio-700 hover:text-white hover:border-studio-500'}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            自定义
          </button>
        </div>
        
        {!showPromptEditor && (
          <p className="text-slate-400 text-xs line-clamp-2" title={description}>{description}</p>
        )}

        {/* Prompt Editor */}
        {showPromptEditor && onPromptChange && (
          <div className="mt-2 animate-fade-in flex flex-col flex-grow">
            <textarea 
              value={currentPrompt || ''}
              onChange={(e) => onPromptChange(e.target.value)}
              className="w-full bg-studio-900/50 text-slate-200 text-xs rounded-md border border-studio-600 p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-2 min-h-[80px]"
              placeholder="输入自定义提示词..."
            />
            <div className="flex justify-end gap-2 mt-auto">
              <button 
                onClick={handleCustomRegenerate}
                disabled={status === 'loading'}
                className="w-full py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {status === 'loading' ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                立即重绘
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
