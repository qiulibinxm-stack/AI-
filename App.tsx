
import React, { useState, useCallback } from 'react';
import UploadArea from './components/UploadArea';
import ResultCard from './components/ResultCard';
import { PHOTO_STYLES } from './constants';
import { GeneratedImage, GenerationStatus } from './types';
import { generateStyledPortrait, extractBase64Data } from './services/geminiService';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<GenerationStatus>('idle');
  
  // Initialize results state with default prompts from configuration
  const [results, setResults] = useState<GeneratedImage[]>(
    PHOTO_STYLES.map(style => ({
      styleId: style.id,
      status: 'pending',
      currentPrompt: style.prompt
    }))
  );

  const handleImageSelected = (base64: string) => {
    setSourceImage(base64);
    // Reset results when new image is uploaded, reloading default prompts
    setResults(PHOTO_STYLES.map(style => ({ 
      styleId: style.id, 
      status: 'pending',
      currentPrompt: style.prompt 
    })));
    setAppStatus('idle');
  };

  const handlePromptChange = (styleId: string, newPrompt: string) => {
    setResults(prev => prev.map(r => 
      r.styleId === styleId ? { ...r, currentPrompt: newPrompt } : r
    ));
  };

  const startGeneration = useCallback(async () => {
    if (!sourceImage) return;

    setAppStatus('processing');

    // Update all to loading initially
    setResults(prev => prev.map(r => ({ ...r, status: 'loading', error: undefined })));

    const { data: imageBytes, mimeType } = extractBase64Data(sourceImage);

    // Launch all requests in parallel
    const promises = results.map(async (resultItem) => {
      // Use the prompt currently in state (in case user modified it before hitting generate all, 
      // though typically this runs on defaults first)
      const promptToUse = resultItem.currentPrompt || 
                          PHOTO_STYLES.find(s => s.id === resultItem.styleId)?.prompt || "";

      try {
        const generatedImageBase64 = await generateStyledPortrait(imageBytes, mimeType, promptToUse);
        
        setResults(prev => prev.map(r => 
          r.styleId === resultItem.styleId 
            ? { ...r, status: 'success', imageUrl: generatedImageBase64 } 
            : r
        ));
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.styleId === resultItem.styleId 
            ? { ...r, status: 'error', error: error instanceof Error ? error.message : '未知错误' } 
            : r
        ));
      }
    });

    await Promise.allSettled(promises);
    setAppStatus('finished');

  }, [sourceImage, results]);

  const handleRegenerateSingle = useCallback(async (styleId: string) => {
    if (!sourceImage) return;

    // Find the current result state to get the (potentially modified) prompt
    const currentResult = results.find(r => r.styleId === styleId);
    const promptToUse = currentResult?.currentPrompt;

    if (!promptToUse) return;

    // Set specific card to loading
    setResults(prev => prev.map(r => 
      r.styleId === styleId ? { ...r, status: 'loading', error: undefined } : r
    ));

    const { data: imageBytes, mimeType } = extractBase64Data(sourceImage);

    try {
      const generatedImageBase64 = await generateStyledPortrait(imageBytes, mimeType, promptToUse);
      
      setResults(prev => prev.map(r => 
        r.styleId === styleId 
          ? { ...r, status: 'success', imageUrl: generatedImageBase64 } 
          : r
      ));
    } catch (error) {
      setResults(prev => prev.map(r => 
        r.styleId === styleId 
          ? { ...r, status: 'error', error: error instanceof Error ? error.message : '未知错误' } 
          : r
      ));
    }
  }, [sourceImage, results]);

  return (
    <div className="min-h-screen bg-studio-900 text-slate-100 font-sans selection:bg-purple-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="bg-studio-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="font-bold text-white text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AI 肖像写真馆
            </h1>
          </div>
          <div className="text-xs font-mono text-studio-highlight bg-studio-800 px-3 py-1 rounded-full border border-studio-700">
            模型: Nano Banana (Gemini 2.5)
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            重塑<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">你的形象</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            只需上传一张照片，立即生成六组不同风格的专业写真。支持自定义提示词微调。
          </p>
        </div>

        {/* Upload Section */}
        <UploadArea 
          onImageSelected={handleImageSelected} 
          isProcessing={appStatus === 'processing'} 
        />

        {/* Action Button */}
        {sourceImage && appStatus !== 'processing' && (
          <div className="flex justify-center mb-16 animate-fade-in-up">
            <button
              onClick={startGeneration}
              className="group relative px-8 py-4 bg-white text-studio-900 font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {appStatus === 'finished' ? (
                  <>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     全部重新生成
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    生成 6 张写真
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 via-white to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"></div>
            </button>
          </div>
        )}

        {/* Status Indicator */}
        {appStatus === 'processing' && (
          <div className="text-center mb-12">
            <p className="text-indigo-400 font-medium animate-pulse mb-2">AI 艺术家正在创作中...</p>
            <div className="w-64 h-1 bg-studio-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-[progress_2s_ease-in-out_infinite] w-1/3"></div>
            </div>
            <style>{`
              @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(300%); }
              }
            `}</style>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PHOTO_STYLES.map((style) => {
            const result = results.find(r => r.styleId === style.id);
            return (
              <ResultCard
                key={style.id}
                title={style.name}
                description={style.description}
                data={result || { styleId: style.id, status: 'pending', currentPrompt: style.prompt }}
                onRegenerate={() => handleRegenerateSingle(style.id)}
                onPromptChange={(newPrompt) => handlePromptChange(style.id, newPrompt)}
              />
            );
          })}
        </div>
      </main>

      <footer className="border-t border-white/5 mt-10 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 AI 肖像写真馆. 由 Gemini Nano Banana 驱动。</p>
      </footer>
    </div>
  );
};

export default App;
