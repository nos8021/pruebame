
import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isDarkMode?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isDarkMode }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
        isDragging 
          ? (isDarkMode ? 'border-white bg-[#252525] scale-[1.02]' : 'border-black bg-gray-50 scale-[1.02]')
          : (isDarkMode ? 'border-white/10 hover:border-white/30 bg-[#1a1a1a] shadow-2xl' : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm')
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="application/pdf"
        className="hidden"
      />
      <div className="flex flex-col items-center space-y-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors ${isDarkMode ? 'bg-[#252525]' : 'bg-gray-50'}`}>
          <svg className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className={`text-lg font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Suelta tu archivo aquí</p>
          <p className="text-sm text-gray-500 mt-1">Soporta PDFs de alta resolución</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 px-8 py-3 rounded-full font-medium transition-all shadow-lg active:scale-95 ${isDarkMode ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-black text-white hover:bg-gray-800 shadow-gray-200'}`}
        >
          Seleccionar Archivo
        </button>
      </div>
    </div>
  );
};
