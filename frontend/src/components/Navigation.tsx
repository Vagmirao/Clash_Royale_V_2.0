import { Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export default function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  return (
    <header className="fixed top-0 w-full z-50 px-6 py-4">
      <nav className="max-w-7xl mx-auto glass rounded-full px-8 py-3 flex items-center justify-between border-primary/20 bg-background-dark/80 backdrop-blur-md">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage('home')}
        >
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary font-bold">query_stats</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-zinc-100 uppercase italic">
            Crown<span className="text-primary">Predictor</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              currentPage === 'home' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-zinc-300 hover:text-primary'
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentPage('predictor')}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              currentPage === 'predictor' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-zinc-300 hover:text-primary'
            }`}
          >
            Win Predictor
          </button>
          <button 
            onClick={() => setCurrentPage('recommendation')}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              currentPage === 'recommendation' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-zinc-300 hover:text-primary'
            }`}
          >
            Recommendation
          </button>
          <button 
            onClick={() => setCurrentPage('builder')}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${
              currentPage === 'builder' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-zinc-300 hover:text-primary'
            }`}
          >
            Builder
          </button>
        </div>
      </nav>
    </header>
  );
}
