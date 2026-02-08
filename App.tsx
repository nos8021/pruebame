import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { Reader } from './components/Reader';
import { PDFFile, AppState } from './types';
import { getAllPDFs, savePDF, deletePDF, StoredPDF } from './services/dbService';

const App: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<PDFFile | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [library, setLibrary] = useState<StoredPDF[]>([]);

  useEffect(() => {
    const meta = document.getElementById('theme-meta');
    if (meta) meta.setAttribute('content', isDarkMode ? '#121212' : '#fcfcf9');
  }, [isDarkMode]);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const files = await getAllPDFs();
        setLibrary(files);
      } catch (err) {
        console.error("Error loading library:", err);
      }
    };
    loadLibrary();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      const stored = await savePDF(file);
      setLibrary(prev => [stored, ...prev]);
      openStoredFile(stored);
    } catch (err) {
      console.error("Error saving file:", err);
      const url = URL.createObjectURL(file);
      setCurrentFile({ name: file.name, url, size: file.size });
      setAppState(AppState.READING);
    }
  };

  const openStoredFile = (stored: StoredPDF) => {
    const url = URL.createObjectURL(stored.data);
    setCurrentFile({ name: stored.name, url: url, size: stored.size });
    setAppState(AppState.READING);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deletePDF(id);
      setLibrary(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const handleBack = useCallback(() => {
    if (currentFile) URL.revokeObjectURL(currentFile.url);
    setCurrentFile(null);
    setAppState(AppState.IDLE);
    window.scrollTo(0, 0);
  }, [currentFile]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-[#fcfcf9] text-[#1a1a1a]'}`}>
      {appState === AppState.IDLE && (
        <>
          <Header />
          <div className="fixed top-6 right-6 md:top-8 md:right-12 z-50">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-4 md:p-3 rounded-2xl transition-all duration-300 shadow-xl border flex items-center space-x-2 ${isDarkMode ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-100'}`}
            >
              {isDarkMode ? (
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-400">{isDarkMode ? 'Claro' : 'Oscuro'}</span>
            </button>
          </div>

          <main className="flex-grow flex flex-col items-center justify-start p-4 md:p-6 pt-20">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12 space-y-4">
                <div className={`inline-block px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em] rounded-full transition-colors ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  Lector Minimalista
                </div>
                <h2 className={`serif text-4xl md:text-6xl font-bold tracking-tight leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Lectura sin <span className={`italic transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>distracciones</span>.
                </h2>
              </div>
              
              <FileUploader onFileSelect={handleFileUpload} isDarkMode={isDarkMode} />

              {library.length > 0 && (
                <div className="mt-20 w-full animate-fade-in">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tu Biblioteca</h3>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-black/5 text-gray-500'}`}>
                      {library.length} Documentos
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {library.map((file) => (
                      <div 
                        key={file.id}
                        onClick={() => openStoredFile(file)}
                        className={`group relative p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center space-x-4 active:scale-[0.98] ${
                          isDarkMode 
                            ? 'bg-[#1a1a1a] border-white/5 hover:bg-[#222]' 
                            : 'bg-white border-gray-100 hover:shadow-xl'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isDarkMode ? 'bg-[#252525]' : 'bg-gray-50'}`}>
                          <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{file.name}</p>
                          <p className="text-[9px] text-gray-500 font-medium uppercase mt-1 tracking-wider">{formatSize(file.size)}</p>
                        </div>
                        <button 
                          onClick={(e) => handleDelete(e, file.id)}
                          className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-gray-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
          <footer className="p-12 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">Lumina • v2.0 Mobile Ready</p>
          </footer>
        </>
      )}

      {currentFile && appState !== AppState.IDLE && (
        <Reader 
          file={currentFile} 
          onBack={handleBack} 
          onStateChange={setAppState}
          state={appState}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default App;