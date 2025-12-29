
import React from 'react';
import { SeriesBible } from '../types';

interface BibleViewProps {
  bible: SeriesBible | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const BibleView: React.FC<BibleViewProps> = ({ bible, isLoading, onGenerate }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-8">
        <div className="w-16 h-16 border-4 border-[#BF360C]/20 border-t-[#BF360C] rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-serif-display text-[#5D4037] animate-pulse">Meditating on Sacred Knowledge...</h2>
        <p className="text-[#8D6E63] text-sm mt-2">Connecting with the divine blueprints.</p>
      </div>
    );
  }

  if (!bible) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF7] p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-[#EFEBE9] flex items-center justify-center mb-8">
          <svg className="w-12 h-12 text-[#5D4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif-display text-[#5D4037] mb-4 uppercase tracking-widest">The Universe Bible</h2>
        <p className="text-[#8D6E63] max-w-lg mb-8 text-lg">
          The foundation of the entire 20-volume series. Generate the character sheets, location guides, and props blueprints to ensure consistency across the universe.
        </p>
        <button 
          onClick={onGenerate}
          className="bg-[#BF360C] hover:bg-[#A32F0A] text-white px-8 py-4 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-xl transition-all"
        >
          Initialize Series Bible
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <span className="text-[10px] text-[#BF360C] uppercase tracking-[0.5em] font-bold block mb-4">Foundation & Lore</span>
        <h1 className="text-5xl font-serif-display text-[#3E2723] uppercase tracking-widest">Universe Bible</h1>
        <div className="w-24 h-1 bg-[#D7C9B1] mx-auto mt-6"></div>
      </header>

      <section className="mb-20">
        <h2 className="text-2xl font-serif-display text-[#5D4037] uppercase tracking-widest mb-10 flex items-center gap-4">
          <span className="bg-[#D7C9B1] h-[1px] flex-1"></span>
          Divine Characters
          <span className="bg-[#D7C9B1] h-[1px] flex-1"></span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bible.characters.map((char, idx) => (
            <div key={idx} className="bg-[#F5F1E9] p-6 rounded-xl border border-[#D7C9B1] hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-serif-display text-[#BF360C] mb-2">{char.name}</h3>
              <p className="text-sm text-[#5D4037] mb-4 leading-relaxed">{char.description}</p>
              <div className="bg-white/50 p-3 rounded-lg border border-[#D7C9B1]/50 italic text-[11px] text-[#8D6E63]">
                <strong>Visual Style:</strong> {char.visuals}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        <section>
          <h2 className="text-2xl font-serif-display text-[#5D4037] uppercase tracking-widest mb-8">Sacred Locations</h2>
          <div className="space-y-6">
            {bible.locations.map((loc, idx) => (
              <div key={idx} className="border-l-4 border-[#BF360C] bg-[#F5F1E9] p-5 rounded-r-xl">
                <h3 className="text-lg font-bold text-[#3E2723] mb-1">{loc.name}</h3>
                <p className="text-sm text-[#8D6E63]">{loc.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif-display text-[#5D4037] uppercase tracking-widest mb-8">Divine Artifacts</h2>
          <div className="space-y-6">
            {bible.props.map((prop, idx) => (
              <div key={idx} className="border-l-4 border-[#D7C9B1] bg-[#F5F1E9] p-5 rounded-r-xl">
                <h3 className="text-lg font-bold text-[#3E2723] mb-1">{prop.name}</h3>
                <p className="text-sm text-[#8D6E63]">{prop.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BibleView;
