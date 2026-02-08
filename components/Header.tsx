
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-8 px-12 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Lumina</h1>
      </div>
      <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
        <a href="#" className="hover:text-black transition-colors">Características</a>
        <a href="#" className="hover:text-black transition-colors">Privacidad</a>
        <a href="https://github.com" target="_blank" className="hover:text-black transition-colors">Github</a>
      </nav>
    </header>
  );
};
