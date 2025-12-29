
import React from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onExportAll: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, onExportAll }) => {
  return (
    <nav className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#D7C9B1] shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setView(AppView.LIBRARY)}
        >
          <div className="w-10 h-10 rounded-full bg-[#5D4037] flex items-center justify-center text-[#FDFBF7] font-serif-display text-xl font-bold border-2 border-[#D7C9B1]">
            R
          </div>
          <div>
            <h1 className="text-[#5D4037] text-lg font-bold uppercase tracking-widest leading-none">
              Ramayana Universe
            </h1>
            <p className="text-[#8D6E63] text-[10px] uppercase tracking-[0.2em] font-medium">
              The Complete Collection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView(AppView.LIBRARY)}
            className={`text-sm uppercase tracking-wider font-bold ${currentView === AppView.LIBRARY ? 'text-[#BF360C]' : 'text-[#5D4037] hover:text-[#BF360C]'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setView(AppView.BIBLE)}
            className={`text-sm uppercase tracking-wider font-bold ${currentView === AppView.BIBLE ? 'text-[#BF360C]' : 'text-[#5D4037] hover:text-[#BF360C]'}`}
          >
            Universe Bible
          </button>
          <button 
            onClick={onExportAll}
            className="hidden md:flex items-center gap-2 bg-[#BF360C] hover:bg-[#A32F0A] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export All 20 Books
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
