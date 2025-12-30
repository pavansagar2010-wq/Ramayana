
import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  stats?: { cover: boolean, pages: number };
  onOpen: (book: Book) => void;
  onPaint: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, stats, onOpen, onPaint }) => {
  const pageProgress = ((stats?.pages || 0) / 24) * 100;

  return (
    <div className="group relative bg-[#F5F1E9] rounded-2xl p-5 mt-6 border border-[#D7C9B1] shadow-md hover:shadow-2xl transition-all flex flex-col">
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#BF360C] flex items-center justify-center text-white font-serif-display text-lg shadow-lg z-20 border-2 border-[#FDFBF7]">
        {book.id}
      </div>

      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-5 bg-white border border-[#D7C9B1] relative">
        {book.coverImage ? (
          <>
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
            <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-[#F5F1E9] opacity-30">
            <svg className="w-16 h-16 text-[#5D4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {book.isGenerating && (
          <div className="absolute inset-0 bg-[#3E2723]/60 flex items-center justify-center backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Progress bar for pages */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10">
          <div className="h-full bg-[#BF360C] transition-all duration-1000" style={{ width: `${pageProgress}%` }}></div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-[#5D4037] font-serif-display text-xl font-bold mb-4 leading-tight min-h-[3rem] flex items-center">{book.title}</h3>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#8D6E63] mb-5">
          <span>{stats?.pages || 0} / 24 Pages Synced</span>
          {stats?.cover && <span className="text-green-600">Cover OK</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onPaint(book)}
          disabled={book.isGenerating || !!book.coverImage}
          className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${book.coverImage ? 'bg-[#D7C9B1] text-[#5D4037] opacity-50 cursor-default' : 'bg-[#5D4037] text-white hover:bg-black'}`}
        >
          {book.coverImage ? 'Artwork Saved' : 'Paint Cover'}
        </button>
        <button 
          onClick={() => onOpen(book)}
          className="bg-[#BF360C] hover:bg-black text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
        >
          Read Scroll
        </button>
      </div>
    </div>
  );
};

export default BookCard;
