import React, { useEffect, useState, useRef } from 'react';
import { PDFFile, AppState } from '../types.ts';
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.0.379';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface ReaderProps {
  file: PDFFile;
  onBack: () => void;
  onStateChange: (state: AppState) => void;
  state: AppState;
  isDarkMode: boolean;
}

export const Reader: React.FC<ReaderProps> = ({ file, onBack, onStateChange, state, isDarkMode }) => {
  const [scrollSpeed, setScrollSpeed] = useState(1.0);
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<number | null>(null);
  const preciseScrollY = useRef<number>(0);

  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(file.url);
        const pdf = await loadingTask.promise;
        const pageUrls: string[] = [];
        const numPages = pdf.numPages; 
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            pageUrls.push(canvas.toDataURL('image/jpeg', 0.85));
          }
        }
        setPages(pageUrls);
      } catch (error) {
        console.error("Error rendering PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [file]);

  useEffect(() => {
    const performScroll = () => {
      if (state === AppState.SCROLLING) {
        preciseScrollY.current += scrollSpeed;
        window.scrollTo(0, preciseScrollY.current);
        scrollRef.current = requestAnimationFrame(performScroll);
      }
    };

    if (state === AppState.SCROLLING) {
      preciseScrollY.current = window.scrollY;
      scrollRef.current = requestAnimationFrame(performScroll);
    } else {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
    }

    return () => {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
    };
  }, [state, scrollSpeed]);

  const toggleScroll = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (state === AppState.SCROLLING) {
      onStateChange(AppState.READING);
    } else {
      onStateChange(AppState.SCROLLING);
    }
  };

  if (isLoading) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-[3000] transition-colors duration-700 ${isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f8f5]'}`}>
        <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${isDarkMode ? 'border-white border-t-transparent' : 'border-black border-t-transparent'}`}></div>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>Cargando Documento...</p>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen select-none transition-colors duration-700 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#f8f8f5]'}`}>
      
      {state === AppState.SCROLLING && (
        <div 
          className="fixed inset-0 z-[2000] cursor-pointer"
          onMouseDown={toggleScroll}
          onTouchStart={toggleScroll}
        />
      )}

      <div className={`fixed inset-x-0 top-0 z-[2100] p-6 flex justify-between items-start pointer-events-none transition-all duration-500 ${state === AppState.SCROLLING ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <button 
          onClick={onBack}
          className={`p-4 rounded-2xl shadow-xl border pointer-events-auto transition-all active:scale-90 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-100 text-black'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className={`p-4 rounded-2xl shadow-xl border pointer-events-auto flex flex-col space-y-2 backdrop-blur-md ${isDarkMode ? 'bg-[#1a1a1a]/80 border-white/10' : 'bg-white/80 border-gray-100'}`}>
          <div className="flex justify-between items-center w-40">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Velocidad</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ml-2 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>{scrollSpeed.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="0.1" max="8.0" step="0.1" 
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
            className="w-full accent-black cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
          />
        </div>
      </div>

      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[2100] transition-all duration-700 ${state === AppState.SCROLLING ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}>
        <button 
          onClick={toggleScroll}
          className={`px-10 py-5 rounded-full shadow-2xl flex items-center space-x-4 group active:scale-95 transition-all border ${isDarkMode ? 'bg-white text-black border-transparent' : 'bg-black text-white border-white/10'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div className="flex flex-col items-start text-left">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Auto-Lectura</span>
            <span className="text-sm font-black uppercase tracking-widest">Reproducir</span>
          </div>
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-12 pb-40 px-4">
        <div className="space-y-12">
          {pages.map((pageUrl, idx) => (
            <div 
              key={idx} 
              className={`rounded-sm overflow-hidden animate-fade-in transition-all duration-700 ${isDarkMode ? 'bg-[#1a1a1a] shadow-[0_30px_70px_rgba(0,0,0,0.4)]' : 'bg-white shadow-[0_30px_70px_rgba(0,0,0,0.04)]'}`}
            >
              <img src={pageUrl} alt={`Página ${idx + 1}`} className="w-full h-auto block" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <div className={`fixed top-0 left-0 w-full h-1 z-[2200] ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
        <div 
          className={`h-full transition-all duration-200 ${isDarkMode ? 'bg-white' : 'bg-black'}`}
          style={{ width: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` }}
        />
      </div>
    </div>
  );
};
