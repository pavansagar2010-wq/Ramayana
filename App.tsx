
import React, { useState, useEffect, useCallback } from 'react';
import { RAMAYANA_BOOKS } from './constants';
import { Book, AppView, SeriesBible, BookPage } from './types';
import { GeminiService } from './services/geminiService';
import Header from './components/Header';
import BookCard from './components/BookCard';
import BookReader from './components/BookReader';
import BibleView from './components/BibleView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LIBRARY);
  const [books, setBooks] = useState<Book[]>(RAMAYANA_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bible, setBible] = useState<SeriesBible | null>(null);
  const [currentPages, setCurrentPages] = useState<BookPage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [gemini, setGemini] = useState<GeminiService | null>(null);

  useEffect(() => {
    setGemini(new GeminiService());
  }, []);

  const handleOpenBook = useCallback(async (book: Book) => {
    if (!gemini) return;
    setLoading(true);
    setSelectedBook(book);
    setView(AppView.READER);
    
    try {
      // Generate scripts
      const pages = await gemini.generateBookPages(book);
      setCurrentPages(pages);
      
      // Automatically paint the first page image
      if (pages.length > 0 && !pages[0].imageUrl) {
        handlePaintPage(pages[0].pageNumber, book.title, pages);
      }
    } catch (error) {
      console.error("Error opening book:", error);
      alert("The divine scrolls are currently inaccessible. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [gemini]);

  const handlePaintPage = useCallback(async (pageNumber: number, bookTitle: string, currentPagesOverride?: BookPage[]) => {
    if (!gemini) return;

    const pagesToUpdate = currentPagesOverride || currentPages;
    const targetPage = pagesToUpdate.find(p => p.pageNumber === pageNumber);
    if (!targetPage) return;

    // Set painting status
    setCurrentPages(prev => prev.map(p => p.pageNumber === pageNumber ? { ...p, isPainting: true } : p));

    try {
      const imageUrl = await gemini.generatePageImage(targetPage, bookTitle);
      setCurrentPages(prev => prev.map(p => p.pageNumber === pageNumber ? { ...p, imageUrl, isPainting: false } : p));
    } catch (error) {
      console.error("Error painting page image:", error);
      setCurrentPages(prev => prev.map(p => p.pageNumber === pageNumber ? { ...p, isPainting: false } : p));
    }
  }, [gemini, currentPages]);

  const handlePaintCover = useCallback(async (book: Book) => {
    if (!gemini) return;
    
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isGenerating: true } : b));
    
    try {
      const coverUrl = await gemini.paintCover(book);
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, coverImage: coverUrl, isGenerating: false } : b));
    } catch (error) {
      console.error("Error painting cover:", error);
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isGenerating: false } : b));
      alert("The celestial brushes are dry. Please try again.");
    }
  }, [gemini]);

  const handleGenerateBible = useCallback(async () => {
    if (!gemini) return;
    setLoading(true);
    try {
      const res = await gemini.generateSeriesBible();
      setBible(res);
    } catch (error) {
      console.error("Error generating bible:", error);
      alert("Could not meditate on the sacred knowledge.");
    } finally {
      setLoading(false);
    }
  }, [gemini]);

  const handleExportAll = () => {
    alert("This feature would generate a 480-page high-resolution PDF spanning all 20 volumes of the Ramayana. For this demo, we've prepared the architectural structure for export.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={view} setView={setView} onExportAll={handleExportAll} />
      
      <main className="flex-1 bg-[#FDFBF7]">
        {view === AppView.LIBRARY && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="text-center mb-16 px-4">
              <span className="text-[10px] text-[#BF360C] uppercase tracking-[0.5em] font-bold block mb-4">The Divine Anthology</span>
              <h1 className="text-4xl md:text-7xl font-serif-display text-[#3E2723] uppercase tracking-tighter mb-6">
                Twenty Sacred Scrolls
              </h1>
              <p className="max-w-2xl mx-auto text-[#8D6E63] text-lg leading-relaxed mb-10">
                The timeless life of Lord Rama retold across 20 volumes. A single click exports the entire sacred collection as a comprehensive PDF.
              </p>
              
              <button 
                onClick={handleExportAll}
                className="bg-[#5D4037] hover:bg-black text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3 mx-auto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export All 20 Books (Complete PDF)
              </button>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {books.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onOpen={handleOpenBook}
                  onPaint={handlePaintCover}
                />
              ))}
            </div>
          </div>
        )}

        {view === AppView.READER && selectedBook && (
          <BookReader 
            book={selectedBook} 
            pages={currentPages} 
            isLoading={loading}
            onBack={() => setView(AppView.LIBRARY)}
            onPaintPage={(pageNum) => handlePaintPage(pageNum, selectedBook.title)}
          />
        )}

        {view === AppView.BIBLE && (
          <BibleView 
            bible={bible} 
            isLoading={loading} 
            onGenerate={handleGenerateBible} 
          />
        )}
      </main>

      <footer className="bg-[#EFEBE9] border-t border-[#D7C9B1] py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-[#5D4037] font-serif-display text-2xl uppercase tracking-[0.2em] mb-4">
            Ramayana Universe
          </div>
          <p className="text-[#8D6E63] text-sm leading-relaxed mb-6">
            A digital tribute to the epic that defines Dharma. Created with respect and technological marvel to inspire the next generation.
          </p>
          <div className="flex justify-center gap-8 mb-8">
             <div className="text-center">
               <span className="block text-2xl font-serif-display text-[#BF360C]">20</span>
               <span className="text-[10px] uppercase tracking-widest text-[#8D6E63] font-bold">Volumes</span>
             </div>
             <div className="text-center">
               <span className="block text-2xl font-serif-display text-[#BF360C]">480</span>
               <span className="text-[10px] uppercase tracking-widest text-[#8D6E63] font-bold">Total Pages</span>
             </div>
             <div className="text-center">
               <span className="block text-2xl font-serif-display text-[#BF360C]">AI</span>
               <span className="text-[10px] uppercase tracking-widest text-[#8D6E63] font-bold">Powered</span>
             </div>
          </div>
          <p className="text-[#A1887F] text-[10px] uppercase tracking-[0.4em]">
            © 2024 Ramayana Comic Universe AI • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
