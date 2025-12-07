import React, { useCallback, useState } from 'react';

interface UploadAreaProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, isProcessing }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageSelected(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  return (
    <div className="w-full max-w-xl mx-auto mb-10">
      <div className="relative group">
        <div className={`
          absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 
          group-hover:opacity-75 transition duration-1000 group-hover:duration-200
          ${isProcessing ? 'animate-pulse' : ''}
        `}></div>
        
        <div className="relative bg-studio-800 ring-1 ring-white/10 rounded-xl leading-none flex flex-col items-center justify-center p-8 transition-all duration-300 min-h-[300px]">
          
          {preview ? (
            <div className="relative w-full h-full flex flex-col items-center">
              <img 
                src={preview} 
                alt="Upload preview" 
                className="max-h-64 rounded-lg shadow-lg border border-studio-600 object-contain mb-4" 
              />
              <div className="flex gap-4">
                 <label 
                  htmlFor="file-upload"
                  className={`
                    px-6 py-2 rounded-full bg-studio-700 hover:bg-studio-600 text-white font-medium cursor-pointer transition-colors
                    ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                  `}
                >
                  更换照片
                </label>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-studio-700/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-studio-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">上传人像</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                请选择一张清晰、高质量的人像照片开始转换。
              </p>
              <label 
                htmlFor="file-upload"
                className="inline-block mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold cursor-pointer shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-1"
              >
                选择图片
              </label>
            </div>
          )}
          
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadArea;