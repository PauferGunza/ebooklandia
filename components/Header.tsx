
import React from 'react';
import { BookIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookIcon className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-slate-800">Gerador de Ebook com IA</span>
        </div>
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
        >
          Ver no GitHub
        </a>
      </div>
    </header>
  );
};