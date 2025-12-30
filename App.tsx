
import React, { useState, useEffect, useCallback } from 'react';
import { RAMAYANA_BOOKS } from './constants';
import { Book, AppView, SeriesLore, BookPage } from './types';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';
import Header from './components/Header';
import BookCard from './components/BookCard';
import BookReader from './components/BookReader';
import LoreView from './components/LoreView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LIBRARY);
  const [books, setBooks] = useState<Book[]>(RAMAYANA_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [lore, setLore] = useState<SeriesLore | null>(null);
  const [currentPages, setCurrentPages] = useState<BookPage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isBulkPainting, setIsBulkPainting] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<string>("");
  const [gemini, setGemini] = useState<GeminiService | null>(null);

  // Status statistics for each book
  const [syncedCounts, setSyncedCounts] = useState<Record<number, { cover: boolean, pages: number }>>({});

  useEffect(() => {
    setGemini(new GeminiService());
    refreshUniverseStats();
  }, []);

  const refreshUniverseStats = async () => {
    const stats: Record<number, { cover: boolean, pages: number }> = {};
    const updatedBooks = await Promise.all(RAMAYANA_BOOKS.map(async (book) => {
      const cover = await StorageService.getCoverFromCloud(book.id);
      const script = await StorageService.getBookScriptFromCloud(book.id);
      let pagesCount = 0;
      if (script) {
        for (const p of script) {
          const img = await StorageService.getPageFromCloud(book.id, p.pageNumber);
          if (img) pagesCount++;
        }
      }
      stats[book.id] = { cover: !!cover, pages: pagesCount };
      return cover ? { ...book, coverImage: cover } : book;
    }));
    setBooks(updatedBooks);
    setSyncedCounts(stats);
    
    const savedLore = await StorageService.getLoreFromCloud();
    if (savedLore) setLore(savedLore);
  };

  const handleOpenBook = useCallback(async (book: Book) => {
    if (!gemini) return;
    setLoading(true);
    setSelectedBook(book);
    setView(AppView.READER);
    
    try {
      let pages = await StorageService.getBookScriptFromCloud(book.id);
      if (!pages) {
        pages = await gemini.generateBookPages(book);
        await StorageService.syncBookScriptToCloud(book.id, pages);
      }
      
      const pagesWithPersistence = await Promise.all(pages.map(async (p: BookPage) => {
        const saved = await StorageService.getPageFromCloud(book.id, p.pageNumber);
        return saved ? { ...p, imageUrl: saved } : p;
      }));

      setCurrentPages(pagesWithPersistence);
    } catch (error) {
      console.error("Open Book Error:", error);
      alert("Divine connection interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [gemini]);

  const handlePaintPage = useCallback(async (pageNumber: number, bookTitle: string) => {
    if (!gemini || !selectedBook) return;

    setCurrentPages(prev => prev.map(p => Number(p.pageNumber) === Number(pageNumber) ? { ...p, isPainting: true } : p));

    try {
      const targetPage = currentPages.find(p => Number(p.p.pageNumber) === Number(pageNumber)) || 
                          (await StorageService.getBookScriptFromCloud(selectedBook.id))?.find(p => Number(p.pageNumber) === Number(pageNumber));
      
      if (!targetPage) throw new Error("Page content missing");

      const imageUrl = await gemini.generatePageImage(targetPage, bookTitle);
      await StorageService.syncPageToCloud(selectedBook.id, pageNumber, imageUrl);
      
      setCurrentPages(prev => prev.map(p => Number(p.pageNumber) === Number(pageNumber) ? { ...p, imageUrl, isPainting: false } : p));
      refreshUniverseStats();
    } catch (error) {
      console.error("Paint Page Error:", error);
      setCurrentPages(prev => prev.map(p => Number(p.pageNumber) === Number(pageNumber) ? { ...p, isPainting: false } : p));
    }
  }, [gemini, currentPages, selectedBook]);

  const handlePaintCover = useCallback(async (book: Book) => {
    if (!gemini) return;
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isGenerating: true } : b));
    
    try {
      const coverUrl = await gemini.paintCover(book);
      await StorageService.syncCoverToCloud(book.id, coverUrl);
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, coverImage: coverUrl, isGenerating: false } : b));
      refreshUniverseStats();
    } catch (error) {
      console.error("Paint Cover Error:", error);
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isGenerating: false } : b));
    }
  }, [gemini]);

  const handlePaintAllUniverse = async () => {
    if (!gemini || isBulkPainting) return;
    if (!confirm("Start Automated Illumination? This will systematically check all 20 volumes and generate ONLY what is missing. This ensures absolute persistence and saves your credits.")) return;

    setIsBulkPainting(true);
    try {
      for (const book of RAMAYANA_BOOKS) {
        // 1. Cover
        const existingCover = await StorageService.getCoverFromCloud(book.id);
        if (!existingCover) {
          setBulkProgress(`[Vol ${book.id}] Painting Sacred Cover...`);
          const coverUrl = await gemini.paintCover(book);
          await StorageService.syncCoverToCloud(book.id, coverUrl);
        }

        // 2. Script
        let pages = await StorageService.getBookScriptFromCloud(book.id);
        if (!pages) {
          setBulkProgress(`[Vol ${book.id}] Scribing Narrative...`);
          pages = await gemini.generateBookPages(book);
          await StorageService.syncBookScriptToCloud(book.id, pages);
        }
        
        // 3. Page Images
        for (let j = 0; j < pages.length; j++) {
          const page = pages[j];
          const existingImage = await StorageService.getPageFromCloud(book.id, page.pageNumber);
          if (!existingImage) {
            setBulkProgress(`[Vol ${book.id}] Painting Page ${page.pageNumber}/${pages.length}...`);
            const imageUrl = await gemini.generatePageImage(page, book.title);
            await StorageService.syncPageToCloud(book.id, page.pageNumber, imageUrl);
          }
        }
        await refreshUniverseStats();
      }
      alert("Divine Illumination Complete! All volumes are secured in persistent storage.");
    } catch (e) {
      console.error("Massive Generation Error:", e);
      alert("A temporary disruption occurred. Progress has been saved.");
    } finally {
      setIsBulkPainting(false);
      setBulkProgress("");
    }
  };

  const generateExportHtml = (title: string, content: string) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora&display=swap');
          body { font-family: 'Lora', serif; background: #FDFBF7; padding: 40px; color: #3E2723; }
          .container { max-width: 900px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 5px double #BF360C; padding-bottom: 30px; margin-bottom: 60px; }
          .title { font-family: 'Playfair Display', serif; font-size: 4rem; color: #BF360C; text-transform: uppercase; margin: 10px 0; }
          .card { background: white; border: 1px solid #D7C9B1; border-radius: 12px; margin-bottom: 60px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); page-break-inside: avoid; }
          .img { width: 100%; display: block; border-bottom: 1px solid #D7C9B1; }
          .inner { padding: 40px; text-align: center; }
          .num { color: #BF360C; font-weight: bold; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 15px; }
          .h { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 20px; }
          .narr { font-size: 1.2rem; margin-bottom: 25px; color: #5D4037; line-height: 1.8; }
          .diag { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.5rem; color: #3E2723; padding: 20px; background: #FDFBF7; border-left: 6px solid #BF360C; display: inline-block; }
          @media print { .card { box-shadow: none; border: 1px solid #D7C9B1; } }
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportBook = async (book: Book, pages: BookPage[]) => {
    setLoading(true);
    let htmlContent = `
      <div class="header">
        <div style="font-weight:bold; letter-spacing:0.3em; color:#8D6E63;">Volume ${book.id}</div>
        <h1 class="title">${book.title}</h1>
        <p style="font-size:1.1rem; max-width:700px; margin:20px auto;">${book.summary}</p>
      </div>
    `;

    for (const p of pages) {
      const img = await StorageService.getPageFromCloud(book.id, p.pageNumber);
      htmlContent += `
        <div class="card">
          ${img ? `<img class="img" src="${img}" />` : `<div style="padding: 100px; background:#f0f0f0; text-align:center;">Illustration Awaiting Generation</div>`}
          <div class="inner">
            <div class="num">Chronicle Page ${p.pageNumber}</div>
            <div class="h">${p.title}</div>
            <div class="narr">${p.narration}</div>
            ${p.dialogue ? `<div class="diag">"${p.dialogue}"</div>` : ''}
          </div>
        </div>
      `;
    }
    setLoading(false);
    generateExportHtml(`Ramayana_Vol_${book.id}_${book.title}`, htmlContent);
  };

  const handleExportAll = async () => {
    if (!confirm("Export Complete Master Anthology? This will include all 20 volumes currently saved in your persistent cloud storage.")) return;
    setLoading(true);
    let masterContent = `<h1 style="text-align:center; font-family:'Playfair Display', serif; font-size:5rem; color:#BF360C; margin-top:200px;">RAMAYANA: THE COMPLETE CHRONICLES</h1>`;
    
    for (const book of RAMAYANA_BOOKS) {
      const pages = await StorageService.getBookScriptFromCloud(book.id);
      if (pages) {
        masterContent += `
          <div style="page-break-before: always; margin-top: 150px;">
            <div class="header">
              <div style="font-weight:bold; letter-spacing:0.3em; color:#8D6E63;">Volume ${book.id}</div>
              <h1 class="title">${book.title}</h1>
            </div>
        `;
        for (const p of pages) {
          const img = await StorageService.getPageFromCloud(book.id, p.pageNumber);
          masterContent += `
            <div class="card">
              ${img ? `<img class="img" src="${img}" />` : `<div style="padding: 80px; background:#f5f5f5; text-align:center;">Illustration Pending</div>`}
              <div class="inner">
                <div class="num">Vol ${book.id} - Page ${p.pageNumber}</div>
                <div class="h">${p.title}</div>
                <div class="narr">${p.narration}</div>
              </div>
            </div>
          `;
        }
        masterContent += `</div>`;
      }
    }
    setLoading(false);
    generateExportHtml("Ramayana_Master_Anthology_20_Volumes", masterContent);
  };

  const handleGenerateLore = useCallback(async () => {
    if (!gemini) return;
    setLoading(true);
    try {
      const res = await gemini.generateSeriesLore();
      await StorageService.syncLoreToCloud(res);
      setLore(res);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [gemini]);

  const handleResetUniverse = async () => {
    if (confirm("PERMANENTLY WIPE ALL PERSISTENT DATA? This cannot be undone.")) {
      await StorageService.clearUniverse();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={view} setView={setView} onExportAll={handleExportAll} />
      <main className="flex-1 bg-[#FDFBF7]">
        {view === AppView.LIBRARY && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="text-center mb-16">
              <span className="text-[10px] text-[#BF360C] uppercase tracking-[0.5em] font-bold block mb-4">A Legacy Restored</span>
              <h1 className="text-4xl md:text-7xl font-serif-display text-[#3E2723] uppercase tracking-tighter mb-6">The Twenty Scrolls</h1>
              <p className="max-w-2xl mx-auto text-[#8D6E63] text-lg mb-10">Synced to Persistent High-Capacity Browser Storage.</p>
              <button 
                onClick={handlePaintAllUniverse} 
                disabled={isBulkPainting} 
                className={`bg-[#BF360C] text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-2xl transition-all ${isBulkPainting ? 'opacity-50' : 'hover:bg-black hover:-translate-y-1'}`}
              >
                {isBulkPainting ? 'Illuminating Scrolls...' : 'Illuminate Complete 20-Book Universe'}
              </button>
              {isBulkPainting && <p className="mt-4 text-[#BF360C] text-[10px] uppercase font-bold tracking-[0.3em] animate-pulse">{bulkProgress}</p>}
            </header>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {books.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  stats={syncedCounts[book.id]}
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
            onExport={handleExportBook}
          />
        )}
        {view === AppView.LORE && <LoreView lore={lore} isLoading={loading} onGenerate={handleGenerateLore} />}
      </main>
      <footer className="bg-[#EFEBE9] border-t border-[#D7C9B1] py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-[#5D4037] font-serif-display text-2xl uppercase tracking-[0.2em] mb-4">Ramayana Universe</div>
          <p className="text-[#8D6E63] text-sm mb-8">This app uses IndexedDB persistence to ensure your images are never lost on refresh. Export to HTML for offline archiving.</p>
          <button onClick={handleResetUniverse} className="text-[10px] text-[#8D6E63] hover:text-[#BF360C] uppercase tracking-[0.3em] font-bold border border-[#D7C9B1] px-6 py-2 rounded-full">Clear Local Persistence</button>
        </div>
      </footer>
    </div>
  );
};

export default App;
