import { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import WinPredictor from './components/WinPredictor';
import Recommendation from './components/Recommendation';
import Builder from './components/Builder';

export type Page = 'home' | 'predictor' | 'recommendation' | 'builder';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
      {currentPage === 'predictor' && <WinPredictor />}
      {currentPage === 'recommendation' && <Recommendation />}
      {currentPage === 'builder' && <Builder />}
      
      {currentPage === 'home' && (
        <footer className="mt-auto py-12 border-t border-white/5 glass">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-secondary text-sm font-bold">query_stats</span>
                </div>
                <span className="text-lg font-black tracking-tighter text-zinc-100 uppercase italic">Crown<span className="text-primary">Predictor</span></span>
              </div>
              <p className="text-zinc-500 text-sm font-medium">© 2024 Crown Predictor Strategy Lab. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
              <a className="text-zinc-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs" href="#">Privacy</a>
              <a className="text-zinc-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs" href="#">Terms</a>
              <a className="text-zinc-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs" href="#">Discord</a>
              <a className="text-zinc-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs" href="#">API</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
