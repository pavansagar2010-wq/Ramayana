
import React from 'react';
import { Book, BookPage } from '../types';

interface BookReaderProps {
  book: Book;
  pages: BookPage[];
  onBack: () => void;
  isLoading: boolean;
  onPaintPage: (pageNumber: number) => void;
  onExport: (book: Book, pages: BookPage[]) => void;
}

const BookReader: React.FC<BookReaderProps> = ({ book, pages, onBack, isLoading, onPaintPage, onExport }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-8">
        <div className="w-16 h-16 border-4 border-[#BF360C]/20 border-t-[#BF360C] rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-serif-display text-[#5D4037] animate-pulse">Scribing Book {book.id}...</h2>
        <p className="text-[#8D6E63] text-sm mt-2 italic">Retrieving divine scriptures and illumination.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      <div className="bg-[#5D4037] text-white py-8 px-4 text-center sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-[#F5F1E9] hover:text-white flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Library
          </button>
          <div className="flex-1 px-4">
            <h2 className="text-xl md:text-3xl font-serif-display uppercase tracking-widest">{book.title}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="h-[1px] w-4 bg-[#D7C9B1]/50"></span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#D7C9B1] font-bold">Volume {book.id} of 20</p>
              <span className="h-[1px] w-4 bg-[#D7C9B1]/50"></span>
            </div>
          </div>
          <button 
            onClick={() => onExport(book, pages)}
            className="bg-[#BF360C] hover:bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Book
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-12 mt-8">
        {pages.map((page) => (
          <div key={`${book.id}_${page.pageNumber}`} className="bg-white border border-[#D7C9B1] shadow-2xl rounded-sm overflow-hidden flex flex-col">
            <div className="bg-[#F5F1E9] border-b border-[#D7C9B1] px-6 py-2 flex justify-between items-center text-[10px] text-[#8D6E63] font-bold uppercase tracking-widest">
              <span>{book.title}</span>
              <span className="text-[#BF360C]">Chronicle Page {page.pageNumber}</span>
            </div>
            
            <div className="aspect-video bg-[#EFEBE9] relative overflow-hidden flex-1 min-h-[400px]">
              {page.imageUrl ? (
                <>
                  <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[9px] font-bold text-green-800 uppercase tracking-tighter">Saved to Cloud</span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  {page.isPainting ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-[#5D4037]/20 border-t-[#5D4037] rounded-full animate-spin mb-4"></div>
                      <p className="text-xs text-[#5D4037] font-bold uppercase tracking-widest animate-pulse">Illuminating Scene...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full border border-[#D7C9B1] flex items-center justify-center mb-4 opacity-50">
                        <svg className="w-8 h-8 text-[#5D4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-bold text-[#5D4037] mb-2 uppercase tracking-widest">Canvas of Legend</h4>
                      <p className="text-xs text-[#8D6E63] italic max-w-sm mb-6">{page.imageDescription}</p>
                      <button 
                        onClick={() => onPaintPage(page.pageNumber)}
                        className="bg-[#5D4037] hover:bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all"
                      >
                        Paint with AI
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 md:p-12 bg-[#FDFBF7] flex flex-col items-center text-center">
              <h3 className="text-[#BF360C] font-serif-display text-xl mb-6 italic underline decoration-[#D7C9B1] underline-offset-8">
                {page.title}
              </h3>
              
              <div className="max-w-3xl space-y-6">
                <p className="text-[#5D4037] text-lg leading-relaxed">
                  {page.narration}
                </p>
                
                {page.dialogue && (
                   <div className="text-[#3E2723] font-serif-display text-xl italic font-medium">
                      "{page.dialogue}"
                   </div>
                )}
                
                {page.vocabularyNote && (
                  <div className="mt-8 pt-4 border-t border-[#D7C9B1] inline-block">
                    <span className="bg-[#EFEBE9] px-2 py-0.5 rounded text-[10px] text-[#5D4037] font-bold uppercase tracking-widest">
                      Wisdom: {page.vocabularyNote}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookReader;
