
import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onOpen: (book: Book) => void;
  onPaint: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onOpen, onPaint }) => {
  return (
    <div className="group relative bg-[#F5F1E9] rounded-2xl p-4 border border-[#D7C9B1] shadow-md hover:shadow-2xl transition-all flex flex-col items-center text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#BF360C] flex items-center justify-center text-white font-serif-display text-lg shadow-inner z-10 border-2 border-[#F5F1E9]">
        {book.id}
      </div>

      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-white border border-[#D7C9B1] relative shadow-inner">
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-[#F5F1E9]">
            <div className="opacity-20 mb-4">
              <svg className="w-16 h-16 text-[#5D4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#8D6E63] font-bold">Awaiting Artwork</span>
          </div>
        )}
        
        {book.isGenerating && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Painting AI Cover...</span>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-[#5D4037] font-serif-display text-lg font-bold mb-3 px-2 leading-tight min-h-[3rem] flex items-center justify-center">
        {book.title}
      </h3>

      <button 
        onClick={() => onPaint(book)}
        disabled={book.isGenerating}
        className="mb-4 bg-[#5D4037] hover:bg-[#3E2723] disabled:opacity-50 text-[#F5F1E9] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-colors"
      >
        Paint AI Cover
      </button>

      <div className="flex flex-wrap justify-center gap-1.5 mb-6">
        {book.keyCharacters.slice(0, 3).map((char, idx) => (
          <span key={idx} className="bg-white px-2 py-0.5 rounded border border-[#D7C9B1] text-[9px] uppercase tracking-tighter text-[#8D6E63] font-semibold">
            {char}
          </span>
        ))}
      </div>

      <button 
        onClick={() => onOpen(book)}
        className="w-full bg-[#3E2723] hover:bg-black text-[#F5F1E9] py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-95"
      >
        Open Chronicle
      </button>
    </div>
  );
};

export default BookCard;
